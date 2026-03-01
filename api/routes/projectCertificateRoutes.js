const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool

// --- CRUD Operations for Project Certificates (projectcertificate) ---

/**
 * @route GET /api/projects/project_certificates
 * @description Get all project certificates.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projectcertificate');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project certificates:', error);
        res.status(500).json({ message: 'Error fetching project certificates', error: error.message });
    }
});

/**
 * @route GET /api/projects/project_certificates/:id
 * @description Get a single project certificate by ID.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM projectcertificate WHERE certificateId = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project certificate not found' });
        }
    } catch (error) {
        console.error('Error fetching project certificate:', error);
        res.status(500).json({ message: 'Error fetching project certificate', error: error.message });
    }
});

/**
 * @route POST /api/projects/project_certificates
 * @description Create a new project certificate.
 */
router.post('/', async (req, res) => {
    const newCertificate = {
        certificateId: req.body.certificateId || `pcert${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        voided: false,
        voidedBy: null,
        ...req.body
    };
    try {
        const [result] = await pool.query('INSERT INTO projectcertificate SET ?', newCertificate);
        if (result.insertId) {
            newCertificate.certificateId = result.insertId;
        }
        res.status(201).json(newCertificate);
    } catch (error) {
        console.error('Error creating project certificate:', error);
        res.status(500).json({ message: 'Error creating project certificate', error: error.message });
    }
});

/**
 * @route PUT /api/projects/project_certificates/:id
 * @description Update an existing project certificate.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    try {
        const [result] = await pool.query('UPDATE projectcertificate SET ? WHERE certificateId = ?', [updatedFields, id]);
        if (result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM projectcertificate WHERE certificateId = ?', [id]);
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Project certificate not found' });
        }
    } catch (error) {
        console.error('Error updating project certificate:', error);
        res.status(500).json({ message: 'Error updating project certificate', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/project_certificates/:id
 * @description Delete a project certificate.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM projectcertificate WHERE certificateId = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Project certificate not found' });
        }
    } catch (error) {
        console.error('Error deleting project certificate:', error);
        res.status(500).json({ message: 'Error deleting project certificate', error: error.message });
    }
});

module.exports = router;
