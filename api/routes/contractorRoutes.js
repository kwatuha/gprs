const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../config/db');

// Multer storage for documents/photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/documents/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// --- Get Projects assigned to a Contractor ---
/**
 * @route GET /api/contractors/:contractorId/projects
 * @description Get all projects assigned to a specific contractor using the join table.
 * @access Private (contractor only)
 */
router.get('/:contractorId/projects', async (req, res) => {
    const { contractorId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT p.* FROM projects p
            JOIN project_contractor_assignments pca ON p.id = pca.projectId
            WHERE pca.contractorId = ? AND pca.voided = 0 AND p.voided = 0`,
            [contractorId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching contractor projects:', error);
        res.status(500).json({ message: 'Error fetching contractor projects', error: error.message });
    }
});

// --- Get Payment Requests by a Contractor ---
/**
 * @route GET /api/contractors/:contractorId/payment-requests
 * @description Get all payment requests submitted by a specific contractor.
 * @access Private (contractor only)
 */
router.get('/:contractorId/payment-requests', async (req, res) => {
    const { contractorId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM project_payment_requests WHERE contractorId = ? AND voided = 0 ORDER BY submittedAt DESC',
            [contractorId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching contractor payment requests:', error);
        res.status(500).json({ message: 'Error fetching contractor payment requests', error: error.message });
    }
});

// --- Get Photos by a Contractor ---
/**
 * @route GET /api/contractors/:contractorId/photos
 * @description Get all photos uploaded by a specific contractor from the `project_documents` table.
 * @access Private (contractor only)
 */
router.get('/:contractorId/photos', async (req, res) => {
    const { contractorId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT
                id AS photoId,
                projectId,
                documentPath AS filePath,
                description AS caption,
                status,
                createdAt AS submittedAt
             FROM project_documents
             WHERE userId = ? AND documentType = 'photo' AND voided = 0
             ORDER BY createdAt DESC`,
            [contractorId] // Assuming userId in documents table corresponds to contractorId
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching contractor photos:', error);
        res.status(500).json({ message: 'Error fetching contractor photos', error: error.message });
    }
});

// --- Photo Upload Route ---
/**
 * @route POST /api/contractors/:contractorId/photos
 * @description A contractor uploads a new photo, which is stored in the `project_documents` table.
 * @access Private (contractor only)
 */
router.post('/:contractorId/photos', upload.single('file'), async (req, res) => {
    const { contractorId } = req.params;
    const { projectId, caption } = req.body;
    const file = req.file;
    if (!file || !projectId) {
        return res.status(400).json({ message: 'File and projectId are required.' });
    }
    const newDocument = {
        projectId,
        documentType: 'photo',
        documentCategory: 'general',
        documentPath: file.path,
        description: caption || `Photo submitted by contractor ${contractorId}`,
        userId: contractorId,
        status: 'pending_review',
        voided: 0,
    };
    try {
        const [result] = await pool.query('INSERT INTO project_documents SET ?', newDocument);
        res.status(201).json({ message: 'Photo uploaded successfully', photoId: result.insertId });
    } catch (error) {
        console.error('Error uploading contractor photo:', error);
        res.status(500).json({ message: 'Error uploading contractor photo', error: error.message });
    }
});

// --- Get All Contractors ---
/**
 * @route GET /api/contractors
 * @description Get all active contractors.
 * @access Private (admin only)
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT contractorId, companyName, contactPerson, email, phone FROM contractors WHERE voided = 0 ORDER BY companyName ASC'
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching contractors:', error);
        res.status(500).json({ message: 'Error fetching contractors', error: error.message });
    }
});

// --- Create New Contractor ---
/**
 * @route POST /api/contractors
 * @description Creates a new contractor record.
 * @access Private (admin only)
 */
router.post('/', async (req, res) => {
    const { companyName, contactPerson, email, phone, userId } = req.body;
    if (!companyName || !email) {
        return res.status(400).json({ message: 'Company name and email are required.' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO contractors (companyName, contactPerson, email, phone, userId) VALUES (?, ?, ?, ?, ?)',
            [companyName, contactPerson, email, phone, userId]
        );
        res.status(201).json({ 
            message: 'Contractor created successfully', 
            contractorId: result.insertId 
        });
    } catch (error) {
        console.error('Error creating contractor:', error);
        res.status(500).json({ message: 'Error creating contractor', error: error.message });
    }
});

// --- Update Contractor ---
/**
 * @route PUT /api/contractors/:contractorId
 * @description Updates an existing contractor's details.
 * @access Private (admin only)
 */
router.put('/:contractorId', async (req, res) => {
    const { contractorId } = req.params;
    const updatedFields = req.body;
    
    // Check if there are any fields to update
    if (Object.keys(updatedFields).length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE contractors SET ? WHERE contractorId = ?',
            [updatedFields, contractorId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contractor not found.' });
        }
        res.status(200).json({ message: 'Contractor updated successfully.' });
    } catch (error) {
        console.error('Error updating contractor:', error);
        res.status(500).json({ message: 'Error updating contractor', error: error.message });
    }
});

// --- Link Contractor to a User ---
/**
 * @route POST /api/contractors/:contractorId/link-user
 * @description Creates a new link between a contractor and a user in the `contractor_users` join table.
 * @access Private (admin only)
 */
router.post('/:contractorId/link-user', async (req, res) => {
    const { contractorId } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'userId is required for linking.' });
    }

    try {
        // Insert a new record into the join table
        const [result] = await pool.query(
            'INSERT INTO contractor_users (contractorId, userId) VALUES (?, ?)',
            [contractorId, userId]
        );

        res.status(201).json({ message: 'Contractor linked to user successfully.', linkId: result.insertId });
    } catch (error) {
        console.error('Error linking contractor to user:', error);
        res.status(500).json({ message: 'Error linking contractor to user', error: error.message });
    }
});

// --- Soft Delete Contractor ---
/**
 * @route PUT /api/contractors/:contractorId/void
 * @description Soft-deletes a contractor by setting the 'voided' flag to 1.
 * @access Private (admin only)
 */
router.delete('/:contractorId', async (req, res) => {
    const { contractorId } = req.params;
    try {
        const [result] = await pool.query(
            'UPDATE contractors SET voided = 1 WHERE contractorId = ?',
            [contractorId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contractor not found.' });
        }
        res.status(200).json({ message: 'Contractor voided successfully.' });
    } catch (error) {
        console.error('Error voiding contractor:', error);
        res.status(500).json({ message: 'Error voiding contractor', error: error.message });
    }
});
module.exports = router;
