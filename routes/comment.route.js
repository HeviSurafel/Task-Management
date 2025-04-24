// routes/comment.routes.js
const express = require('express');
const { addComment, getComments } = require('../controller/comment.controller');
const {protectRoute} = require('../middleware/auth');

const router = express.Router();

// Route to add a new comment to a task
router.post('/tasks/:taskId/comments', protectRoute, addComment);

// Route to get all comments for a specific task
router.get('/tasks/:taskId/comments', protectRoute, getComments);

module.exports = router;