const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Project = require('../models/projects');


router.post('/project', async (req, res) => {
    try {
        const {
            title,
            description,
            clientName,
            startDate,
            status,
            priority
        } = req.body;

        const newProject = new Project({
            title,
            description,
            clientName,
            startDate,
            status,
            priority
        });

        await newProject.save();
        res.status(201).json({ message: 'Project added successfully' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

router.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.send(projects)
    } catch (error) {
        res.status(500).json({ message: error });
    }
});
router.delete("/project/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Project.findByIdAndDelete(id);
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});
router.put("/project/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, clientName, startDate, status, priority } = req.body;
        await Project.findByIdAndUpdate(id, { title, description, clientName, startDate, status, priority });
        res.status(200).json({ message: "Project updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});


module.exports = router