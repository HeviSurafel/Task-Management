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
  console.log("here we are", req.params);
  try {
    const { employeeId } = req.params;

    // First validate if the employee exists by searching with the user ID
    const employee = await Employee.findOne({ user: employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Now get tasks assigned to this employee using the employee._id
    const tasks = await Task.find({ assignTo: employee._id })
      .populate({
        path: "project",
        select: "title clientName status files",
      })
      .populate({
        path: "assignTo",
        populate: {
          path: "user",
          select: "firstName lastName",
        },
      })
      .sort({ createdAt: -1 });

    // Log activity
    const activityLog = new ActivityLog({
      user: req.user._id,
      action: `Viewed tasks for employee ${employee._id}`,
      entity: "Task",
      entityId: null,
      changes: {
        employee: employee._id,
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

const getEmployeeDashboard = asyncHandler(async (req, res) => {
  console.log("req.params", req.params);
  try {
    const { employeeId } = req.params; // This should be the user's ObjectId

    // Validate if the employee exists by searching for the user reference
    const employee = await Employee.findOne({ user: employeeId }).populate('user');
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
console.log("hello employee",employee)
    // Now get the employee's 6-digit ID for task lookup if needed
    const employeeSixDigitId = employee.employee_id;

    // Fetch tasks assigned to the employee using the correct identifier
    const tasks = await Task.find({ assignTo: employee._id }) // Ensure this uses the correct field
      .select("title status dueDate priority ")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch recent activities for the employee
    const recentActivities = await ActivityLog.find({ user: employeeId })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    // Calculate task statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === "Completed").length;
    const inProgressTasks = tasks.filter(task => task.status === "In Progress").length;

    // Prepare dashboard data
    const dashboardData = {
      employeeInfo: {
        employeeId: employeeSixDigitId,
        userId: employee.user,
        createdAt:employee.startDate,
        department:employee.department,
        role:employee.user.role
        // Add any other employee details you want to include
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        recentTasks: tasks.slice(0, 5),
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
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
    console.error("Get Employee Dashboard Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID format",
        error: error.message,
      });
    }

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
      message: "Failed to load employee dashboard data",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

/**
 * @desc    Update task status
 * @route   PUT /api/tasks/:taskId/status
 * @access  Private
 */
const updateTaskStatus = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Validate allowed status values
    const allowedStatus = ["Pending", "In Progress", "Completed", "On Hold"];
    if (!allowedStatus.includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        allowedStatus,
      });
    }

    // Find the task with populated createdBy and assignTo
    const task = await Task.findById(taskId)
      .populate('createdBy')
      .populate('assignTo')
      .session(session);

    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if the current user is assigned to this task
    if (task.assignTo._id.toString() !== userId.toString() && req.user.role !== 'Admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save({ session });

    // Notification logic
    const notificationPromises = [];
    
    // 1. Notify task creator when status changes to Completed
    if (status === "Completed" && task.createdBy._id.toString() !== userId.toString()) {
      const completionNotification = new Notification({
        title: "Task Completed",
        description: `Task "${task.title}" has been marked as completed by ${req.user.firstName} ${req.user.lastName}`,
        type: "task-completion",
        read: false,
        relatedTask: task._id,
        employee: task.createdBy._id,
        date: new Date(),
      });
      notificationPromises.push(completionNotification.save({ session }));
    }

    // 2. Notify admin when employee updates status (except to Completed which is handled above)
    if (req.user.role !== 'Admin' && status !== "Completed") {
      // Assuming you have a way to get admin users - this might need adjustment
      // For now, notifying the task creator if they're admin
      if (task.createdBy.role === 'Admin') {
        const statusUpdateNotification = new Notification({
          title: "Task Status Updated",
          description: `Task "${task.title}" status changed from ${oldStatus} to ${status} by ${req.user.firstName} ${req.user.lastName}`,
          type: "task-update",
          read: false,
          relatedTask: task._id,
          employee: task.createdBy._id,
          date: new Date(),
        });
        notificationPromises.push(statusUpdateNotification.save({ session }));
      }
    }

    // Activity log
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
    notificationPromises.push(activityLog.save({ session }));

    // Execute all notifications and logs in parallel
    await Promise.all(notificationPromises);

    await session.commitTransaction();
    session.endSession();

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
    await session.abortTransaction();
    session.endSession();
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
  getEmployeeDashboard
};