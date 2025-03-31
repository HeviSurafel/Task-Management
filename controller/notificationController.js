const Notification = require("../models/notification");
const Employee = require("../models/Employee");

// Create a new notification
exports.createNotification = async (req, res) => {
    try {
        const { title, description, employee, date, type } = req.body;

        // Check if employee exists
        const existingEmployee = await Employee.findById(employee);
        if (!existingEmployee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const notification = new Notification({
            title,
            description,
            employee,
            date,
            type
        });

        await notification.save();
        res.status(201).json({ message: "Notification created successfully", notification });
    } catch (error) {
        res.status(500).json({ message: "Error creating notification", error });
    }
};

// Get all notifications
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().populate("employee", "firstName lastName");
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications", error });
    }
};

// Get notifications by employee ID
exports.getNotificationsByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const notifications = await Notification.find({ employee: employeeId }).populate("employee", "firstName lastName");
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
