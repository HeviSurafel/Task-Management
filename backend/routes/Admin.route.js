const express = require("express");
const router = express.Router();
const Employee = require("../models/employees");
const Project = require("../models/projects");
//employee controller

const { protectRoute, adminRoute } = require("../middleware/auth");
//creating task controller by admin
const {
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
  projectDashboard,getDashboardTasks
} = require("../controller/admin.controller");
//get tasks dashboard
router.get("/task/dashboard", protectRoute, adminRoute, getDashboardTasks);
router.post("/task", protectRoute, adminRoute, createTask);
router.get("/tasks", protectRoute, adminRoute, getTasks);
router.put("/task/:id", protectRoute, adminRoute, updateTask);
router.delete("/task/:id", protectRoute, adminRoute, deleteTask);
//employee routes

router.post("/employee", protectRoute, adminRoute, createEmployee);
router.get("/employees", protectRoute, adminRoute, getEmployees);
router.get("/employees-stats", protectRoute, adminRoute, getEmployeeStats);
router.put("/employee/:id", protectRoute, adminRoute, updateEmployee);
router.delete("/employee/:id", protectRoute, adminRoute, deleteEmployee);
// dashboard routes
router.get("/dashboard", protectRoute, adminRoute, dashboard);
// project route
router.get("/project/dashboard", protectRoute, adminRoute, projectDashboard);
router.post("/project", protectRoute, adminRoute, createProject);
router.get("/projects", protectRoute, adminRoute, getProjects);
router.delete("/project/:id", protectRoute, adminRoute, deleteProject);
router.put("/project/:id", protectRoute, adminRoute, updateProject);
module.exports = router;
