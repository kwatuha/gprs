// src/routes/metadata/programRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../../config/db'); // Correct path for the new folder structure

// --- Programs CRUD ---

/**
 * @route GET /api/metadata/programs/
 * @description Get all programs that are not soft-deleted.
 * @access Public (can be protected by middleware)
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT programId, programme, createdAt, updatedAt, userId FROM programs WHERE voided = 0');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ message: 'Error fetching programs', error: error.message });
    }
});

/**
 * @route POST /api/metadata/programs/
 * @description Create a new program.
 * @access Private (requires authentication and privilege)
 */
router.post('/', async (req, res) => {
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now
    const { programme, remarks } = req.body;

    if (!programme) {
        return res.status(400).json({ message: 'Missing required field: programme' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO programs (programme, remarks, userId) VALUES (?, ?, ?)',
            [programme, remarks, userId]
        );
        res.status(201).json({ message: 'Program created successfully', programId: result.insertId });
    } catch (error) {
        console.error('Error creating program:', error);
        res.status(500).json({ message: 'Error creating program', error: error.message });
    }
});

/**
 * @route PUT /api/metadata/programs/:programId
 * @description Update an existing program by programId.
 * @access Private (requires authentication and privilege)
 */
router.put('/:programId', async (req, res) => {
    const { programId } = req.params;
    const { programme, remarks } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE programs SET programme = ?, remarks = ?, updatedAt = CURRENT_TIMESTAMP WHERE programId = ? AND voided = 0',
            [programme, remarks, programId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Program not found or already deleted' });
        }
        res.status(200).json({ message: 'Program updated successfully' });
    } catch (error) {
        console.error('Error updating program:', error);
        res.status(500).json({ message: 'Error updating program', error: error.message });
    }
});

/**
 * @route DELETE /api/metadata/programs/:programId
 * @description Soft delete a program by programId.
 * @access Private (requires authentication and privilege)
 */
router.delete('/:programId', async (req, res) => {
    const { programId } = req.params;
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now

    try {
        const [result] = await pool.query(
            'UPDATE programs SET voided = 1, voidedBy = ? WHERE programId = ? AND voided = 0',
            [userId, programId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Program not found or already deleted' });
        }
        res.status(200).json({ message: 'Program soft-deleted successfully' });
    } catch (error) {
        console.error('Error deleting program:', error);
        res.status(500).json({ message: 'Error deleting program', error: error.message });
    }
});


// --- Sub-Programs CRUD ---

/**
 * @route GET /api/metadata/programs/:programId/subprograms
 * @description Get all sub-programs belonging to a specific program.
 * @access Public (can be protected by middleware)
 */
router.get('/:programId/subprograms', async (req, res) => {
    const { programId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT subProgramId, subProgramme FROM subprograms WHERE programId = ? AND voided = 0',
            [programId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error(`Error fetching sub-programs for program ${programId}:`, error);
        res.status(500).json({ message: `Error fetching sub-programs for program ${programId}`, error: error.message });
    }
});

/**
 * @route POST /api/metadata/programs/subprograms
 * @description Create a new sub-program.
 * @access Private (requires authentication and privilege)
 */
router.post('/subprograms', async (req, res) => {
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now
    const { programId, subProgramme, remarks } = req.body;

    if (!programId || !subProgramme) {
        return res.status(400).json({ message: 'Missing required fields: programId, subProgramme' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO subprograms (programId, subProgramme, remarks, userId) VALUES (?, ?, ?, ?)',
            [programId, subProgramme, remarks, userId]
        );
        res.status(201).json({ message: 'Sub-program created successfully', subProgramId: result.insertId });
    } catch (error) {
        console.error('Error creating sub-program:', error);
        res.status(500).json({ message: 'Error creating sub-program', error: error.message });
    }
});

/**
 * @route PUT /api/metadata/programs/subprograms/:subProgramId
 * @description Update an existing sub-program by subProgramId.
 * @access Private (requires authentication and privilege)
 */
router.put('/subprograms/:subProgramId', async (req, res) => {
    const { subProgramId } = req.params;
    const { programId, subProgramme, remarks } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE subprograms SET programId = ?, subProgramme = ?, remarks = ?, updatedAt = CURRENT_TIMESTAMP WHERE subProgramId = ? AND voided = 0',
            [programId, subProgramme, remarks, subProgramId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sub-program not found or already deleted' });
        }
        res.status(200).json({ message: 'Sub-program updated successfully' });
    } catch (error) {
        console.error('Error updating sub-program:', error);
        res.status(500).json({ message: 'Error updating sub-program', error: error.message });
    }
});

/**
 * @route DELETE /api/metadata/programs/subprograms/:subProgramId
 * @description Soft delete a sub-program by subProgramId.
 * @access Private (requires authentication and privilege)
 */
router.delete('/subprograms/:subProgramId', async (req, res) => {
    const { subProgramId } = req.params;
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now

    try {
        const [result] = await pool.query(
            'UPDATE subprograms SET voided = 1, voidedBy = ? WHERE subProgramId = ? AND voided = 0',
            [userId, subProgramId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sub-program not found or already deleted' });
        }
        res.status(200).json({ message: 'Sub-program soft-deleted successfully' });
    } catch (error) {
        console.error('Error deleting sub-program:', error);
        res.status(500).json({ message: 'Error deleting sub-program', error: error.message });
    }
});

module.exports = router;