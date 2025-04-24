const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const redis = require("../Middleware/Redis");
const transporter = require("../config/nodemailer");
const asyncHandler = require("express-async-handler");
const { AsyncResource } = require("async_hooks");
const Attendance = require("../models/attendances");
const Notification = require("../models/notification");
const Employee = require("../models/employees");
const mongoose = require("mongoose");
function convertTo24Hour(time12h) {
  const [time, period] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours);
  if (period === "PM" && hours < 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

function calculateDuration(timeIn, timeOut) {
  const timeInDate = new Date(`2000-01-01T${convertTo24Hour(timeIn)}`);
  const timeOutDate = new Date(`2000-01-01T${convertTo24Hour(timeOut)}`);

  const timeDiff = timeOutDate - timeInDate;
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}
// Generate tokens
const generateToken = async (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

// Store refresh token in Redis
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );
};

// Store tokens in cookies
const storeCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Signup
const signup = asyncHandler(async (req, res) => {
  console.log("here we are",req.body)
  const {
    phone,
    role,
    dateOfBirth,
    startDate,
    gender,
    firstName,
    lastName,
    email,
    password,
  } = req.body;

  try {
    // Validate required fields
    if (!phone || !role || !dateOfBirth || !startDate || !gender || 
        !firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "Email already exists" 
      });
    }

    // Generate unique 6-digit employee ID
    let employee_id;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      employee_id = Math.floor(100000 + Math.random() * 900000).toString();
      isUnique = !(await Employee.findOne({ employee_id }));
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate unique employee ID"
      });
    }

    // Start transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create user first
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        role,
        status: "inactive"
      });

      await user.save({ session });

      // Create employee record
      const employee = new Employee({
        employee_id,
        user: user._id,
        phone,
        role,
        dateOfBirth: new Date(dateOfBirth),
        startDate: new Date(startDate),
        gender
      });

      await employee.save({ session });

      // Update user with employee reference
      user.employeeDetails = employee._id;
      await user.save({ session });

      // Commit transaction if all operations succeed
      await session.commitTransaction();

    
      res.status(201).json({
        success: true,
        data: {
          id: user._id,
          employee_id: employee.employee_id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          status: user.status,
          message: "Account created successfully. Pending admin activation."
        }
      });

    } catch (error) {
      // If any error occurs, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Signup Error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        error: error.message
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});
// Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email and populate the employee data
    const user = await User.findOne({ email }).populate("employeeDetails");

    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the user's account is inactive
    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive. Please contact the admin for activation.",
      });
    }

    // Check if the user's account is suspended
    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Contact the admin.",
      });
    }

    // Compare the entered password with the stored one
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate tokens (access and refresh)
    const { accessToken, refreshToken } = await generateToken(user._id);

    // Store tokens in cookies
    storeCookies(res, accessToken, refreshToken);

    // Store the refresh token in the database
    await storeRefreshToken(user._id, refreshToken);
console.log("user",user)
    // Respond with comprehensive user data
    res.status(200).json({
      success: true,
      id: user._id,
      employee_id: user.employee_id?.employee_id, // 6-digit employee ID
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user?.role, // From employee record
      status: user.status,
      profile: user.profile,
      phone: user.employee_id?.phone, // From employee record
      dateOfBirth: user.employee_id?.dateOfBirth, // From employee record
      startDate: user.employee_id?.startDate, // From employee record
      gender: user.employee_id?.gender, // From employee record
      message: "User logged in successfully",
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Logout
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  try {
    if (refreshToken) {
      const decode = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await redis.del(`refresh_token:${decode.userId}`);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Refresh Token
const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  try {
    if (!refreshToken) {
      return res.status(401).json({ message: "No token found" });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (refreshToken !== storedToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    const { accessToken } = await generateToken(decoded.userId);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.status(200).json({ message: "Access token refreshed" });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get Profile
const getProfile = asyncHandler(async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get All Users (Admin Only)
const getAllUser = asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Admin only" });
    }
    const users = await User.find({
      _id: { $ne: req.user._id },
      role: { $ne: "admin" },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Request Password Reset
const requestPasswordReset = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpires = Date.now() + 3600000; // 1 hour
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const mailOptions = {
      to: user.email,
      from: "surafelwondu47@gmail.com",
      subject: "Password Reset Request",
      text: `You are receiving this because you (or someone else) have requested a password reset for your account.\n\n
        Please click on the following link, or paste it into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent", email });
  } catch (error) {
    console.error("Request Password Reset Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newpassword, email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    user.password = newpassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  console.log("req.params", req.body);

  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
const updateProfile = asyncHandler(async (req, res) => {
  const { email } = req.user;
  const { address, phone } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.address = user.address;
    user.phone = phone;
    await user.save();
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
const attendance = asyncHandler(async (req, res) => {
  try {
    const { employeeId, day, timeIn, timeOut } = req.body;

    let existingAttendance = await Attendance.findOne({
      employee: employeeId,
      day: day,
    });

    if (existingAttendance && timeOut && existingAttendance.timeIn) {
      const { hours, minutes } = calculateDuration(
        existingAttendance.timeIn,
        timeOut
      );
      // Update existing attendance record
      existingAttendance.timeOut = timeOut;
      existingAttendance.workingHours = `${hours} hour:${minutes} minutes`;
      await existingAttendance.save();
      res.status(200).json({ message: "Time Out Marked Successfully" });
    } else if (timeIn) {
      if (!existingAttendance) {
        const newAttendance = new Attendance({
          employee: employeeId,
          day: day,
          timeIn: timeIn,
          timeOut: null,
          workingHours: null,
        });
        await newAttendance.save();
        res.status(201).json({ message: "Time In Marked Successfully" });
      } else {
        res
          .status(400)
          .json({ message: "TimeIn Is Already Exist In Attendance Sheet" });
      }
    } else {
      res.status(400).json({ message: "TimeIn Is Missing" });
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
});
const notification = asyncHandler(
  asyncHandler(async (req, res) => {
    try {
      const { title, description } = req.body;
      const newNotification = new Notification({ title, description });
      await newNotification.save();
      res.status(201).json({ message: "Notification added successfully" });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  })
);
module.exports = {
  signup,
  login,
  logout,
  updateProfile,
  refreshToken,
  getProfile,
  getAllUser,
  requestPasswordReset,
  resetPassword,
  updatePassword,
  attendance,
  notification,
};
