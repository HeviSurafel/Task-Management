const express = require("express");
const router = express.Router();
const { protectRoute, adminRoute } = require("../middleware/auth");
const {
  getEmployeeTasks,
  updateTaskStatus,
  getEmployeeDashboard
} = require("../controller/task.controller");
router.get("/:employeeId", protectRoute, getEmployeeDashboard);
router.get("/employees/:employeeId/tasks", protectRoute, getEmployeeTasks);
router.put("/tasks/:taskId/status", protectRoute, updateTaskStatus);
module.exports = router;