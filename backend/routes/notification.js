const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Create a new notification
router.post("/", notificationController.createNotification);

// Get all notifications
router.get("/", notificationController.getAllNotifications);

// Get notifications by employee ID
router.get("/:employeeId", notificationController.getNotificationsByEmployee);

// Mark a notification as read
router.put("/:notificationId/read", notificationController.markAsRead);

// Delete a notification
router.delete("/:notificationId", notificationController.deleteNotification);

module.exports = router;
