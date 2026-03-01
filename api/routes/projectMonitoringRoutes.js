const express = require('express');
// We use { mergeParams: true } because we need projectId from the parent router
const router = express.Router({ mergeParams: true });
const pool = require('../config/db'); // Import the database connection pool

// --- Project Monitoring Records API Calls (project_monitoring_records) ---

/**
 * @route POST /api/projects/:projectId/monitoring
 * @description Creates a new monitoring record for a project, including observations, recommendations, and challenges.
 * @access Private (requires authentication and privilege)
 */
router.post('/', async (req, res) => {
    const { projectId } = req.params;
    const { comment, recommendations, challenges, warningLevel, isRoutineObservation } = req.body;

    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now

    if (!projectId || !comment) {
        return res.status(400).json({ message: 'Missing required fields: projectId, comment' });
    }

    const newRecord = {
        projectId,
        comment,
        recommendations, // Added
        challenges, // Added
        warningLevel: warningLevel || 'None',
        isRoutineObservation: isRoutineObservation || 1,
        userId,
        createdAt: new Date(),
        voided: 0,
    };

    try {
        const [result] = await pool.query('INSERT INTO project_monitoring_records SET ?', newRecord);
        const [rows] = await pool.query('SELECT * FROM project_monitoring_records WHERE recordId = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating project monitoring record:', error);
        res.status(500).json({ message: 'Error creating project monitoring record', error: error.message });
    }
});

// GET route remains the same as it uses 'SELECT *' and will fetch all columns automatically.
/**
 * @route GET /api/projects/:projectId/monitoring
 * @description Get all active monitoring records for a specific project.
 * @access Private (protected by middleware)
 */
router.get('/', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM project_monitoring_records WHERE projectId = ? AND voided = 0 ORDER BY observationDate DESC',
            [projectId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project monitoring records:', error);
        res.status(500).json({ message: 'Error fetching project monitoring records', error: error.message });
    }
});

/**
 * @route PUT /api/projects/:projectId/monitoring/:recordId
 * @description Update an existing monitoring record.
 * @access Private (requires authentication and privilege)
 */
// CORRECTED: The path should be just '/:recordId' because the parent already provides '/:projectId/monitoring'
router.put('/:recordId', async (req, res) => {
    const { projectId, recordId } = req.params;
    const { comment, recommendations, challenges, warningLevel, isRoutineObservation } = req.body;

    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1;

    const updatedFields = {
        comment,
        recommendations, // Added
        challenges, // Added
        warningLevel,
        isRoutineObservation,
        updatedAt: new Date(),
    };

    try {
        const [result] = await pool.query(
            'UPDATE project_monitoring_records SET ? WHERE recordId = ? AND projectId = ? AND voided = 0',
            [updatedFields, recordId, projectId] // Added projectId for an extra layer of security
        );

        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM project_monitoring_records WHERE recordId = ?', [recordId]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Monitoring record not found or already deleted' });
        }
    } catch (error) {
        console.error('Error updating project monitoring record:', error);
        res.status(500).json({ message: 'Error updating project monitoring record', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/:projectId/monitoring/:recordId
 * @description Soft delete a monitoring record.
 * @access Private (requires authentication and privilege)
 */
// CORRECTED: The path should be just '/:recordId'
router.delete('/:recordId', async (req, res) => {
    const { projectId, recordId } = req.params;
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1;

    try {
        const [result] = await pool.query(
            'UPDATE project_monitoring_records SET voided = 1, voidedBy = ? WHERE recordId = ? AND projectId = ? AND voided = 0',
            [userId, recordId, projectId] // Added projectId for security
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Monitoring record not found or already deleted' });
        }
        res.status(200).json({ message: 'Monitoring record soft-deleted successfully' });
    } catch (error) {
        console.error('Error deleting project monitoring record:', error);
        res.status(500).json({ message: 'Error deleting project monitoring record', error: error.message });
    }
});

module.exports = router;