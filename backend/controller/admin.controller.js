const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Task = require("../models/tasks");
const Notification = require("../models/notification");
const Employee = require("../models/employees");
const asyncHandler = require("express-async-handler");
const ActivityLog = require("../models/activityLogSchema");
const User = require("../models/users");
const Project = require("../models/projects");
const mongoose = require("mongoose");
const upload = require("../config/multerConfig");
const uploadFiles = upload.array("files", 5); // Allow up to 5 files
/**
 * @desc    Get dashboard task statistics (both global and employee-specific)
 * @route   GET /api/tasks/dashboard
 * @access  Private
 */
const getDashboardTasks = asyncHandler(async (req, res) => {
  try {
    // Get all tasks in parallel with employee tasks if employeeId is provided
    const [allTasks, employeeTasks] = await Promise.all([
      Task.find({})
        .populate({
          path: 'assignTo',
          select: 'employee_id user', // Changed from firstName/lastName since those are in User
          populate: [
            {
              path: 'user',
              select: 'firstName lastName'
            },
            {
              path: 'employee_id',
              select: 'department'
            }
          ]
        })
        .populate({
          path: 'createdBy',
          select: 'firstName lastName'
        })
        .populate({
          path: 'project',
          select: 'name'
        }),
      req.query.employeeId 
        ? Task.find({ assignTo: req.query.employeeId })
            .populate({
              path: 'assignTo',
              select: 'employee_id user',
              populate: [
                {
                  path: 'user',
                  select: 'firstName lastName'
                },
                {
                  path: 'employee_id',
                  select: 'department'
                }
              ]
            })
            .populate({
              path: 'createdBy',
              select: 'firstName lastName'
            })
            .populate({
              path: 'project',
              select: 'name'
            })
        : null
    ]);

    // Helper function to format task data
    const formatTaskData = (task) => ({
      _id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      startDate: task.startDate,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      priority: task.priority,
      project: task.project?.name || 'No Project',
      createdBy: task.createdBy ? `${task.createdBy.firstName} ${task.createdBy.lastName}` : 'System',
      assignee: task.assignTo ? {
        name: task.assignTo.user ? `${task.assignTo.user.firstName} ${task.assignTo.user.lastName}` : 'Unassigned',
        employeeId: task.assignTo.employee_id?.employee_id,
        department: task.assignTo.employee_id?.department
      } : null
    });

    // Rest of your function remains the same...
    const completedTasks = allTasks.filter(task => task.status === "Completed").length;
    const inProgressTasks = allTasks.filter(task => task.status === "In Progress").length;
    const pendingTasks = allTasks.filter(task => task.status === "Pending").length;
    const overdueTasks = allTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed"
    ).length;
    const totalTasks = allTasks.length;

    // Task distribution by priority
    const priorityDistribution = {
      High: allTasks.filter(task => ['High', 'Most Important'].includes(task.priority)).length,
      Medium: allTasks.filter(task => ['Medium', 'Important'].includes(task.priority)).length,
      Low: allTasks.filter(task => ['Low', 'Least Important'].includes(task.priority)).length
    };

    // Task distribution by department
    const departmentDistribution = allTasks.reduce((acc, task) => {
      if (task.assignTo?.employee_id?.department) {
        const dept = task.assignTo.employee_id.department;
        acc[dept] = (acc[dept] || 0) + 1;
      }
      return acc;
    }, {});

    // Recent tasks (last 5 created)
    const recentTasks = allTasks
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(formatTaskData);

    // Prepare response data
    const responseData = {
      globalStats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        priorityDistribution,
        departmentDistribution,
        recentTasks
      }
    };

    // Add employee-specific stats if requested
    if (req.query.employeeId && employeeTasks) {
      const empCompleted = employeeTasks.filter(task => task.status === "Completed").length;
      const empInProgress = employeeTasks.filter(task => task.status === "In Progress").length;
      const empPending = employeeTasks.filter(task => task.status === "Pending").length;
      const empTotal = employeeTasks.length;

      responseData.employeeStats = {
        totalTasks: empTotal,
        completedTasks: empCompleted,
        inProgressTasks: empInProgress,
        pendingTasks: empPending,
        completionRate: empTotal > 0 ? Math.round((empCompleted / empTotal) * 100) : 0,
        recentTasks: employeeTasks
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 5)
          .map(formatTaskData)
      };
    }

    res.status(200).json({
      success: true,
      data: responseData,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Dashboard Tasks Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard task data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
const deleteTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
const createTask = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      assignTo, // Employee ID who the task is assigned to
      project,
      startDate,
      priority,
    } = req.body;

    // Create a new task
    const newTask = new Task({
      title,
      description,
      assignTo,
      project,
      startDate,
      priority,
    });

    // Save the new task
    await newTask.save();

    // Find the employee to whom the task is assigned
    const employee = await Employee.findById(assignTo);

    if (employee) {
      // Create a new notification for the employee
      const newNotification = new Notification({
        title: title,
        description: `You have been assigned a new task: ${title}`,
        employee: assignTo, // Reference to the employee
        date: new Date(),
        type: "task-assignment", // Define the type of the notification
        read: false,
      });

      // Save the notification
      await newNotification.save();

      // Optionally, you can send a real-time notification using something like WebSockets or an email
      // This could be integrated based on your app's requirements

      res
        .status(201)
        .json({ message: "Task added successfully and notification sent" });
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const getTasks = asyncHandler(async (req, res) => {
  try {
    const tasks = await Task.find();
    res.send(tasks);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
const updateTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assignTo, project, startDate, priority } =
      req.body;
    await Task.findByIdAndUpdate(id, {
      title,
      description,
      assignTo,
      project,
      startDate,
      priority,
    });
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
const createEmployee = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      dateOfBirth,
      startDate,
      gender,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !role ||
      !dateOfBirth ||
      !startDate ||
      !gender
    ) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
        requiredFields: [
          "firstName",
          "lastName",
          "email",
          "phone",
          "password",
          "role",
          "dateOfBirth",
          "startDate",
          "gender",
        ],
      });
    }

    // Check for existing user by email
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        field: "email",
      });
    }

    // Generate unique 6-digit employee ID
    let employee_id;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      employee_id = Math.floor(100000 + Math.random() * 900000).toString();
      const existingEmployee = await Employee.findOne({ employee_id }).session(
        session
      );
      if (!existingEmployee) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      await session.abortTransaction();
      return res.status(500).json({
        success: false,
        message:
          "Failed to generate unique employee ID after multiple attempts",
        maxAttempts: maxAttempts,
      });
    }

    // Create user first
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      status: "active",
    });

    await newUser.save({ session });

    // Create employee record
    const newEmployee = new Employee({
      employee_id,
      user: newUser._id,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      startDate: new Date(startDate),
      gender,
    });

    await newEmployee.save({ session });

    // Update user with employee reference
    newUser.employeeDetails = newEmployee._id;
    await newUser.save({ session });

    // Commit transaction
    await session.commitTransaction();
    // Successful response
    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: {
        employee_id: newEmployee.employee_id,
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        startDate: newEmployee.startDate,
        employeeDetails: {
          phone: newEmployee.phone,
          dateOfBirth: newEmployee.dateOfBirth,
          gender: newEmployee.gender,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Employee Creation Error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate value for ${field}`,
        field: field,
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Generic error handler
    res.status(500).json({
      success: false,
      message: "Internal server error during employee creation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    session.endSession();
  }
});

const getEmployees = asyncHandler(async (req, res) => {
  try {
    // First get all users with their employee data populated
    const usersWithEmployees = await User.find({
      employeeDetails: { $exists: true },
    })
      .populate({
        path: "employeeDetails",
        select: " phone dateOfBirth startDate gender employee_id _id ",
      })
      .select("firstName _id lastName email status role profile employee_id")
      .lean();
    const employees = usersWithEmployees.map((user) => ({
      ...user.employee_id,
      _id: user.employeeDetails._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      profile: user.profile,
      role: user.role,
      gender: user.employeeDetails.gender,
      phone: user.employeeDetails.phone,
      employee_id: user.employeeDetails.employee_id,
    }));

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error("Get Employees Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
});
const getEmployeeStats = asyncHandler(async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: "Active" });
    const inActiveEmployees = await Employee.countDocuments({
      status: "In Active",
    });
    const terminatedEmployees = await Employee.countDocuments({
      status: "Terminated",
    });

    const employeesStats = {
      totalEmployees,
      activeEmployees,
      inActiveEmployees,
      terminatedEmployees,
    };

    res.status(200).json(employeesStats);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
const updateEmployee = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employee_id,
      firstName,
      lastName,
      email,
      phone,
      residentialAddress,
      cnic,
      role,
      dateOfBirth,
      startDate,
      status,
      gender,
    } = req.body;
    await Employee.findByIdAndUpdate(id, {
      employee_id,
      firstName,
      lastName,
      email,
      phone,
      residentialAddress,
      cnic,
      role,
      dateOfBirth,
      startDate,
      status,
      gender,
    });
    res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
const deleteEmployee = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await Employee.findByIdAndDelete(id);
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
const dashboard = asyncHandler(async (req, res) => {
  try {
    // Get all data in parallel for better performance
    const [
      totalEmployees,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      allTasks,
      genderDistribution,
      departmentDistribution,
      recentActivities,
      newHiresThisMonth,
      usersWithEmployees,
    ] = await Promise.all([
      // Employee counts
      Employee.countDocuments(),

      // User status counts (active)
      User.countDocuments({ status: "active" }),

      // User status counts (inactive)
      User.countDocuments({ status: "inactive" }),

      // User status counts (suspended)
      User.countDocuments({ status: "suspended" }),

      // Task data with populated assignee
      Task.find()
        .select("title status dueDate priority assignee")
        .populate({
          path: "assignTo",
          select: "firstName lastName status",
          populate: {
            path: "employee_id",
            select: "role department gender",
          },
        })
        .sort({ createdAt: -1 })
        .lean(),

      // Gender distribution from Employee model
      Employee.aggregate([
        {
          $group: {
            _id: "$gender",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Department distribution from Employee model
      Employee.aggregate([
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Recent activities (last 5)
      ActivityLog.find()
        .sort({ timestamp: -1 })
        .limit(5)
        .populate({
          path: "user",
          select: "firstName lastName",
          populate: {
            path: "employee_id",
            select: "role",
          },
        })
        .lean(),

      // New hires this month (based on employee startDate)
      Employee.countDocuments({
        startDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      }),

      // Get users with their employee data
      User.find()
        .populate({
          path: "employeeDetails",
          select: " department gender startDate",
        })
        .lean(),
    ]);

    // Calculate percentages
    const calculatePercentage = (value, total) =>
      total > 0 ? Math.round((value / total) * 100) : 0;

    // Prepare statistics from usersWithEmployees
    const employeeStats = usersWithEmployees.reduce(
      (stats, user) => {
        if (user.employee_id) {
          // Count by role
          const role = user.employee_id.role;
          stats.byRole[role] = (stats.byRole[role] || 0) + 1;

          // Count by status
          const status = user.status;
          stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

          // Count active employees
          if (user.status === "active") {
            stats.activeEmployees++;
          }
        }
        return stats;
      },
      {
        byRole: {},
        byStatus: {},
        activeEmployees: 0,
      }
    );

    // Prepare dashboard data
    const dashboardData = {
      employees: {
        total: totalEmployees,
        active: activeUsers,
        inactive: inactiveUsers,
        suspended: suspendedUsers,
        activeEmployees: employeeStats.activeEmployees,
        activePercentage: calculatePercentage(activeUsers, totalEmployees),
        inactivePercentage: calculatePercentage(inactiveUsers, totalEmployees),
        suspendedPercentage: calculatePercentage(
          suspendedUsers,
          totalEmployees
        ),
        genderDistribution,
        departmentDistribution,
        newHiresThisMonth,
        byRole: employeeStats.byRole,
        byStatus: employeeStats.byStatus,
      },
      tasks: {
        total: allTasks.length,
        completed: allTasks.filter((task) => task.status === "Completed")
          .length,
        inProgress: allTasks.filter((task) => task.status === "In Progress")
          .length,
        pending: allTasks.filter((task) => task.status === "Pending").length,
        recentTasks: allTasks.slice(0, 5),
        completionRate: calculatePercentage(
          allTasks.filter((task) => task.status === "Completed").length,
          allTasks.length
        ),
        // Tasks by assignee status
        byAssigneeStatus: allTasks.reduce((acc, task) => {
          const status = task.assignee?.status || "unassigned";
          if (!acc[status]) acc[status] = 0;
          acc[status]++;
          return acc;
        }, {}),
      },
      activities: {
        recent: recentActivities,
        totalToday: recentActivities.filter(
          (activity) =>
            new Date(activity.timestamp).toDateString() ===
            new Date().toDateString()
        ).length,
      },
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    if (error.name === "MongoError") {
      return res.status(503).json({
        success: false,
        message: "Database service unavailable",
        error: error.message,
        suggestion: "Please try again later or contact support",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});
//create project
const createProject = asyncHandler(async (req, res) => {
  // First handle the file upload
  uploadFiles(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    const user = req.user._id;
    try {
      const { title, description, clientName, startDate, status, priority } =
        req.body;

      // Prepare files data if any files were uploaded
      const files = req.files
        ? req.files.map((file) => ({
            path: file.path,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          }))
        : [];

      const newProject = new Project({
        title,
        description,
        clientName,
        startDate,
        user,
        status,
        priority,
        files,
      });

      await newProject.save();
      res.status(201).json({
        message: "Project added successfully",
        project: newProject,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
});
const projectDashboard = asyncHandler(async (req, res) => {
  try {
    const projects = await Project.find();
    const totalProjects = projects.length;
    const OnHoldProjects = projects.filter(
      (project) => project.status === "On Hold"
    ).length;
    const completedProjects = projects.filter(
      (project) => project.status === "Completed"
    ).length;
    const InProgressProject = projects.filter(
      (project) => project.status === "In Progress"
    ).length;
    const TestingProjects = projects.filter(
      (project) => project.status === "Testing"
    ).length;
    const project=await Project.find().populate("user");
    res.status(200).json({
      success: true,
      project,
      data: {
        totalProjects,
        OnHoldProjects,
        completedProjects,
        InProgressProject,
        TestingProjects,
      },
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error("Project Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load project dashboard data",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});
const getProjects = asyncHandler(async (req, res) => {
  try {
    const projects = await Project.find();
    res.send(projects);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
const deleteProject = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
const updateProject = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, clientName, startDate, status, priority } =
      req.body;
    await Project.findByIdAndUpdate(id, {
      title,
      description,
      clientName,
      startDate,
      status,
      priority,
    });
    res.status(200).json({ message: "Project updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
module.exports = {
  updateTask,
  getTasks,
  deleteTask,
  createTask,
  createEmployee,
  getEmployees,
  getEmployeeStats,
  updateEmployee,
  deleteEmployee,
  dashboard,
  createProject,
  getProjects,
  deleteProject,
  updateProject,
  projectDashboard,
  getDashboardTasks
};
