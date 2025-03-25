const express = require('express');
const router = express.Router();
const Notification = require('../models/notifications');
const asyncHandler = require('express-async-handler');
router.post('/notification', asyncHandler(async (req, res) => {
    try {
        const { title, description } = req.body;
        const newNotification = new Notification({ title, description });
        await newNotification.save();
        res.status(201).json({ message: 'Notification added successfully' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
}));
module.exports = router