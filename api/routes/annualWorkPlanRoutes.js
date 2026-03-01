// src/routes/annualWorkPlanRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// --- Helper Function: Format Date for MySQL DATETIME column ---
const formatToMySQLDateTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        console.warn('Invalid date provided to formatToMySQLDateTime:', date);
        return null;
    }
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// GET all work plans for a specific subprogram
router.get('/by-subprogram/:subProgramId', async (req, res) => {
    const { subProgramId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM annual_workplans WHERE subProgramId = ? AND voided = 0', [subProgramId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching work plans:', error);
        res.status(500).json({ message: 'Error fetching work plans', error: error.message });
    }
});

// GET a single work plan by ID
router.get('/:workplanId', async (req, res) => {
    const { workplanId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM annual_workplans WHERE workplanId = ? AND voided = 0', [workplanId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Work plan not found' });
        }
    } catch (error) {
        console.error('Error fetching work plan:', error);
        res.status(500).json({ message: 'Error fetching work plan', error: error.message });
    }
});

// POST a new work plan
router.post('/', async (req, res) => {
    const newWorkPlan = {
        ...req.body,
        voided: 0,
        createdAt: formatToMySQLDateTime(new Date()),
        updatedAt: formatToMySQLDateTime(new Date()),
    };
    try {
        const [result] = await pool.query('INSERT INTO annual_workplans SET ?', newWorkPlan);
        res.status(201).json({ ...newWorkPlan, workplanId: result.insertId });
    } catch (error) {
        console.error('Error creating work plan:', error);
        res.status(500).json({ message: 'Error creating work plan', error: error.message });
    }
});

// PUT an existing work plan
router.put('/:workplanId', async (req, res) => {
    const { workplanId } = req.params;
    const updatedFields = {
        ...req.body,
        updatedAt: formatToMySQLDateTime(new Date()),
        // CORRECTED: Ensure createdAt is in the right format for the update
        createdAt: req.body.createdAt ? formatToMySQLDateTime(req.body.createdAt) : undefined,
    };
    delete updatedFields.workplanId;
    delete updatedFields.voided;
    try {
        const [result] = await pool.query('UPDATE annual_workplans SET ? WHERE workplanId = ?', [updatedFields, workplanId]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM annual_workplans WHERE workplanId = ?', [workplanId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Work plan not found' });
        }
    } catch (error) {
        console.error('Error updating work plan:', error);
        res.status(500).json({ message: 'Error updating work plan', error: error.message });
    }
});

// DELETE a work plan (soft delete)
router.delete('/:workplanId', async (req, res) => {
    const { workplanId } = req.params;
    try {
        const [result] = await pool.query('UPDATE annual_workplans SET voided = 1 WHERE workplanId = ?', [workplanId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Work plan not found' });
        }
    } catch (error) {
        console.error('Error soft-deleting work plan:', error);
        res.status(500).json({ message: 'Error soft-deleting work plan', error: error.message });
    }
});

module.exports = router;