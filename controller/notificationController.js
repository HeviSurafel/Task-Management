const Notification = require("../models/notification");
const Employee = require("../models/employees");


// Get notifications by employee ID
exports.getNotificationsByEmployee = async (req, res) => {
    console.log("req.params",req.params)
    try {
        const { employeeId } = req.params;
        const notifications = await Notification.find({ employee: employeeId });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Error fetching employee notifications", error });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
        res.status(500).json({ message: "Error marking notification as read", error });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting notification", error });
    }
};
