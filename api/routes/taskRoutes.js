// src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- IMPORTANT: No camelToSnakeCase/snakeToCamelCase helpers are needed in this file ---
// Because your DB columns are already camelCase, and frontend sends camelCase.

// GET all tasks (optional, if you need a route for all tasks regardless of project)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tasks');
        res.status(200).json(rows); // Direct return, as DB columns are camelCase
    } catch (error) {
        console.error('Error fetching all tasks:', error);
        res.status(500).json({ message: 'Error fetching all tasks', error: error.message });
    }
});

// GET tasks for a specific project
router.get('/project/:projectId', async (req, res) => {
    const { projectId } = req.params; // projectId is camelCase from URL
    try {
        // Use 'projectId' for the database column, as per your schema
        const [rows] = await pool.query('SELECT * FROM tasks WHERE projectId = ?', [projectId]);
        res.status(200).json(rows); // Return directly
    } catch (error) {
        console.error(`Error fetching tasks for project ${projectId}:`, error);
        res.status(500).json({ message: `Error fetching tasks for project ${projectId}`, error: error.message });
    }
});

// GET a single task by taskId
router.get('/:taskId', async (req, res) => {
    const { taskId } = req.params; // taskId is camelCase from URL
    try {
        // Use 'taskId' for the database column, as per your schema
        const [rows] = await pool.query('SELECT * FROM tasks WHERE taskId = ?', [taskId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Return directly
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ message: 'Error fetching task', error: error.message });
    }
});

// POST new task
router.post('/', async (req, res) => {
    // req.body contains camelCase from frontend (taskName, startDate, endDate, dueDate, projectId, etc.)
    // It might also contain 'assignees' and 'dependencies' arrays which need to be removed for the main task table
    const clientData = { ...req.body }; // Create a shallow copy to modify

    // Remove assignees and dependencies arrays as they are handled by separate junction tables/routes
    delete clientData.assignees;
    delete clientData.dependencies;

    const newTask = {
        createdAt: new Date(), // Use 'createdAt' as per DB schema
        updatedAt: new Date(), // Use 'updatedAt' as per DB schema
        ...clientData // This now only includes simple columns for tasks
    };

    // Remove 'taskId' if client provides it and DB auto-increments
    delete newTask.taskId; 

    try {
        console.log('Inserting Task:', newTask); // Log data going to DB
        const [result] = await pool.query('INSERT INTO tasks SET ?', newTask);
        
        if (result.insertId) {
            newTask.taskId = result.insertId;
        }

        res.status(201).json(newTask); // Return the created task as camelCase
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
});

// PUT update task
router.put('/:taskId', async (req, res) => {
    const { taskId } = req.params; // taskId is camelCase from URL
    const clientData = { ...req.body }; // Create a shallow copy to modify

    // Remove assignees and dependencies arrays as they are handled by separate junction tables/routes
    delete clientData.assignees;
    delete clientData.dependencies;

    const updatedFields = {
        ...clientData,
        updatedAt: new Date() // Use 'updatedAt' as per DB schema
    };

    // Remove 'taskId' from the body to prevent attempting to update primary key
    delete updatedFields.taskId; 

    try {
        console.log(`Updating Task ${taskId}:`, updatedFields); // Log data going to DB
        const [result] = await pool.query('UPDATE tasks SET ? WHERE taskId = ?', [updatedFields, taskId]);
        
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM tasks WHERE taskId = ?', [taskId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
});

// DELETE task
router.delete('/:taskId', async (req, res) => {
    const { taskId } = req.params; // taskId is camelCase from URL
    try {
        const [result] = await pool.query('DELETE FROM tasks WHERE taskId = ?', [taskId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        console.error(`Error deleting task with ID ${taskId}:`, error);
        res.status(500).json({ message: `Error deleting task with ID ${taskId}`, error: error.message });
    }
});

module.exports = router;