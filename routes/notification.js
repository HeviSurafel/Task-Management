const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController");
const {protectRoute} = require("../middleware/auth");

// Get notifications by employee ID
router.get("/notifications/:employeeId",protectRoute, notificationController.getNotificationsByEmployee);

// Mark a notification as read
router.put("/notifications/:notificationId/read",protectRoute, notificationController.markAsRead);

// Delete a notification
router.delete("/notifications/:notificationId",protectRoute, notificationController.deleteNotification);

module.exports = router;
