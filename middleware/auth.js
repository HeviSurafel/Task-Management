const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Employee = require("../models/employees"); // Import Employee model
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const protectRoute = async (req, res, next) => {
  try {
      const accessToken = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];
      
      if (!accessToken) {
          return res.status(401).json({ 
              success: false,
              message: "Unauthorized - No access token provided" 
          });
      }

      try {
          // Verify token
          const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
          
          // Find user - no need to populate since role is now in User
          const user = await User.findById(decoded.userId)
              .select("-password");

          if (!user) {
              return res.status(401).json({ 
                  success: false,
                  message: "User not found" 
              });
          }

          // Check account status
          if (user.status !== 'active') {
              return res.status(403).json({ 
                  success: false,
                  message: `Account is ${user.status}. Contact admin.` 
              });
          }

          // Attach user to request
          req.user = user.toObject();

          next();
      } catch (error) {
          if (error.name === "TokenExpiredError") {
              return res.status(401).json({ 
                  success: false,
                  message: "Session expired. Please login again",
                  code: "TOKEN_EXPIRED"
              });
          }
          throw error;
      }
  } catch (error) {
      console.error('ProtectRoute Error:', error);
      res.status(401).json({ 
          success: false,
          message: "Invalid access token",
          error: error.message
      });
  }
};

// Admin route middleware
const adminRoute = async (req, res, next) => {
  try {
      if (!req.user) {
          return res.status(401).json({ 
              success: false,
              message: "User not authenticated" 
          });
      }

      // Check role from populated employee data
      if (req.user.role === "Ceo" || 'Department Head' ||'supervisor') {
          return next();
      }

      res.status(403).json({
          success: false,
          message: "Unauthorized - Admin access only",
          requiredRole: "Admin",
          yourRole: req.user.role || "none"
      });
  } catch (error) {
      console.error("AdminRoute Error:", error);
      res.status(500).json({ 
          success: false,
          message: "Internal server error" 
      });
  }
};

// Employee route middleware
const employeeRoute = async (req, res, next) => {
  try {
      if (!req.user) {
          return res.status(401).json({ 
              success: false,
              message: "User not authenticated" 
          });
      }

      // Allow both employees and admins
      if (req.user.role === "Employee" || req.user.role === "Admin") {
          return next();
      }

      res.status(403).json({
          success: false,
          message: "Unauthorized - Employee access only",
          requiredRole: "Employee",
          yourRole: req.user.role || "none"
      });
  } catch (error) {
      console.error("EmployeeRoute Error:", error);
      res.status(500).json({ 
          success: false,
          message: "Internal server error" 
      });
  }
};

module.exports = { protectRoute, adminRoute, employeeRoute };