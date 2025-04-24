// controllers/comment.controller.js
const Task=require("../models/tasks")
const Notification=require("../models/notification")
const Comment = require('../models/Comment');
const asyncHandler = require('express-async-handler');
const mongoose=require("mongoose")
/**
 * @desc    Add a new comment to a task
 * @route   POST /api/tasks/:taskId/comments
 * @access  Private
 */
const addComment = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
console.log("user in add comment",req.user);
  try {
    const { taskId } = req.params;
    const { text } = req.body;
    const author = req.user._id;

    // Create new comment
    const newComment = new Comment({
      taskId,
      author,
      text,
    });

    await newComment.save({ session });

    // Fetch the task with populated createdBy and assignTo
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

    // Determine notification recipients based on who is commenting
    let notificationRecipients = [];
console.log("task comment",task)
    if (req.user.role === 'Ceo' || 'Employee'||'Department Head' ||'supervisor') {
      // If admin comments, notify the assigned employee
      notificationRecipients.push(task.assignTo.user);
    } else {
      // If employee comments, notify:
      // 1. The task creator (if different from current user)
      if (task.createdBy._id.toString() !== req.user._id.toString()) {
        notificationRecipients.push(task.createdBy);
      }
      
      // 2. Any other admins assigned to the task (if applicable)
      // You might need additional logic here if you have multiple admins
    }

    // Create notifications for all recipients
    const notificationPromises = notificationRecipients.map(async (recipient) => {
      const notification = new Notification({
        title: "New Comment Added",
        description: `A new comment was added to the task "${task.title}" by ${req.user.firstName} ${req.user.lastName}`,
        type: "comment",
        read: false,
        employee: recipient._id,
        relatedTask: task._id,
        date: new Date(),
      });
      return notification.save({ session });
    });

    await Promise.all(notificationPromises);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Add Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
});

/**
 * @desc    Get comments for a specific task
 * @route   GET /api/tasks/:taskId/comments
 * @access  Private
 */
const getComments = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const comments = await Comment.find({ taskId })
    .populate('author', 'firstName lastName')
    .populate('replies.author', 'firstName lastName');

  res.status(200).json({
    success: true,
    data: comments,
  });
});

module.exports = {
  addComment,
  getComments,
};