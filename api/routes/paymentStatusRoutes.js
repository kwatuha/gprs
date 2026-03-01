const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authenticate');
const privilege = require('../middleware/privilegeMiddleware');

// --- Routes for payment_status_definitions ---

// @route   GET /api/payment-statuses/
// @desc    Get all payment status definitions.
// @access  Private (requires 'payment_status_definitions.read')
router.get('/', auth, privilege(['payment_status_definitions.read']), async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM payment_status_definitions');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch payment status definitions', error: error.message });
    }
});

// @route   POST /api/payment-statuses/
// @desc    Create a new payment status definition.
// @access  Private (requires 'payment_status_definitions.create')
router.post('/', auth, privilege(['payment_status_definitions.create']), async (req, res) => {
    const { statusName, description } = req.body;
    if (!statusName) {
        return res.status(400).json({ message: 'Status name is required.' });
    }
    try {
        const [result] = await db.query('INSERT INTO payment_status_definitions SET ?', { statusName, description });
        res.status(201).json({ message: 'Payment status created successfully.', statusId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create payment status', error: error.message });
    }
});

// @route   PUT /api/payment-statuses/:statusId
// @desc    Update a payment status definition.
// @access  Private (requires 'payment_status_definitions.update')
router.put('/:statusId', auth, privilege(['payment_status_definitions.update']), async (req, res) => {
    const { statusId } = req.params;
    const { statusName, description } = req.body;
    try {
        const [result] = await db.query('UPDATE payment_status_definitions SET statusName = ?, description = ? WHERE statusId = ?', [statusName, description, statusId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Payment status not found.' });
        }
        res.json({ message: 'Payment status updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update payment status', error: error.message });
    }
});

// @route   DELETE /api/payment-statuses/:statusId
// @desc    Delete a payment status definition.
// @access  Private (requires 'payment_status_definitions.delete')
router.delete('/:statusId', auth, privilege(['payment_status_definitions.delete']), async (req, res) => {
    const { statusId } = req.params;
    try {
        const [result] = await db.query('DELETE FROM payment_status_definitions WHERE statusId = ?', [statusId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Payment status not found.' });
        }
        res.json({ message: 'Payment status deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete payment status', error: error.message });
    }
});

module.exports = router;