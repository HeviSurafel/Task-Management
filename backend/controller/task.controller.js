const asyncHandler = require("express-async-handler");
const Task = require("../models/tasks");
const Notification = require("../models/notification");
const Employee = require("../models/employees");
const ActivityLog = require("../models/activityLogSchema");

/**
 * @desc    Get all tasks for a specific employee
 * @route   GET /api/employees/:employeeId/tasks
 * @access  Private
 */
const getEmployeeTasks = asyncHandler(async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Validate employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Get tasks assigned to this employee
    const tasks = await Task.find({ assignTo: employeeId })
      .populate({
        path: "project",
        select: "title clientName status",
      })
      .sort({ createdAt: -1 });

    // Log activity
    const activityLog = new ActivityLog({
      user: req.user._id,
      action: `Viewed tasks for employee ${employeeId}`,
      entity: "Task",
      entityId: null,
      changes: {
        employee: employeeId,
      },
    });
    await activityLog.save();

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Get Employee Tasks Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee tasks",
      error: error.message,
    });
  }
});

/**
 * @desc    Update task status
 * @route   PUT /api/tasks/:taskId/status
 * @access  Private
 */
const updateTaskStatus = asyncHandler(async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Validate allowed status values
    const allowedStatus = ["Pending", "In Progress", "Completed", "On Hold"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        allowedStatus,
      });
    }

    // Find and update the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if the current user is assigned to this task
    if (task.assignTo.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    // Create notification for manager/admin if status changed to Completed
    if (status === "Completed") {
      const notification = new Notification({
        title: "Task Completed",
        description: `Task "${task.title}" has been marked as completed by ${req.user.firstName} ${req.user.lastName}`,
        type: "task-completion",
        read: false,
        relatedTask: task._id,
      });
      await notification.save();
    }

    // Log activity
    const activityLog = new ActivityLog({
      user: userId,
      action: "Updated task status",
      entity: "Task",
      entityId: task._id,
      changes: {
        status: {
          from: oldStatus,
          to: status,
        },
      },
    });
    await activityLog.save();

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: {
        _id: task._id,
        title: task.title,
        oldStatus,
        newStatus: task.status,
      },
    });
  } catch (error) {
    console.error("Update Task Status Error:", error);
    
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update task status",
      error: error.message,
    });
  }
});

module.exports = {
  getEmployeeTasks,
  updateTaskStatus,
};