const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Task = require('../models/tasks');
const Notification=require('../models/notification');
const Employee=require("../models/employees")
router.post('/task', async (req, res) => {
    try {
        const {
            title,
            description,
            assignTo,  // Employee ID who the task is assigned to
            project,
            startDate,
            priority
        } = req.body;

        // Create a new task
        const newTask = new Task({
            title,
            description,
            assignTo,
            project,
            startDate,
            priority
        });

        // Save the new task
        await newTask.save();

        // Find the employee to whom the task is assigned
        const employee = await Employee.findById(assignTo);

        if (employee) {
            // Create a new notification for the employee
            const newNotification = new Notification({
                title: title,
                description: `You have been assigned a new task: ${title}`,
                employee: assignTo,  // Reference to the employee
                date: new Date(),
                type: 'task-assignment',  // Define the type of the notification
            });

            // Save the notification
            await newNotification.save();

            // Optionally, you can send a real-time notification using something like WebSockets or an email
            // This could be integrated based on your app's requirements

            res.status(201).json({ message: 'Task added successfully and notification sent' });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.send(tasks)
    } catch (error) {
        res.status(500).json({ message: error });
    }
});
router.put("/task/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, assignTo, project, startDate, priority } = req.body;
        await Task.findByIdAndUpdate(id, { title, description, assignTo, project, startDate, priority });
        res.status(200).json({ message: "Task updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});
router.delete("/task/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Task.findByIdAndDelete(id);
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});
module.exports = router