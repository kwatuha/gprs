const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authenticate');
const privilege = require('../middleware/privilegeMiddleware');

// --- Routes for payment_approval_levels ---

// GET all approval levels
router.get('/', auth, privilege(['approval_levels.read']), async (req, res) => {
    try {
        const [levels] = await db.query('SELECT * FROM payment_approval_levels ORDER BY approvalOrder ASC');
        res.json(levels);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch approval levels', error: error.message });
    }
});

// POST a new approval level
router.post('/', auth, privilege(['approval_levels.create']), async (req, res) => {
    const { levelName, roleId, approvalOrder } = req.body;
    if (!levelName || !roleId || approvalOrder === undefined) {
        return res.status(400).json({ message: 'levelName, roleId, and approvalOrder are required.' });
    }
    try {
        const [result] = await db.query('INSERT INTO payment_approval_levels SET ?', { levelName, roleId, approvalOrder });
        res.status(201).json({ message: 'Approval level created successfully.', levelId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create approval level', error: error.message });
    }
});

// PUT to update an approval level
router.put('/:levelId', auth, privilege(['approval_levels.update']), async (req, res) => {
    const { levelId } = req.params;
    const { levelName, roleId, approvalOrder } = req.body;
    try {
        const [result] = await db.query('UPDATE payment_approval_levels SET levelName = ?, roleId = ?, approvalOrder = ? WHERE levelId = ?', [levelName, roleId, approvalOrder, levelId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Approval level not found.' });
        }
        res.json({ message: 'Approval level updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update approval level', error: error.message });
    }
});

// DELETE an approval level
router.delete('/:levelId', auth, privilege(['approval_levels.delete']), async (req, res) => {
    const { levelId } = req.params;
    try {
        const [result] = await db.query('DELETE FROM payment_approval_levels WHERE levelId = ?', [levelId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Approval level not found.' });
        }
        res.json({ message: 'Approval level deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete approval level', error: error.message });
    }
});

// --- Routes for payment_details ---

// GET a payment details record by requestId
router.get('/payment-details/:requestId', auth, privilege(['payment_details.read']), async (req, res) => {
    const { requestId } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM payment_details WHERE requestId = ?', [requestId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Payment details not found for this request.' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch payment details', error: error.message });
    }
});

// POST to create a new payment details record
router.post('/payment-details', auth, privilege(['payment_details.create']), async (req, res) => {
    const { requestId, paymentMode, bankName, accountNumber, transactionId, notes, paidByUserId } = req.body;
    if (!requestId || !paymentMode || !paidByUserId) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }
    const newDetails = { requestId, paymentMode, bankName, accountNumber, transactionId, notes, paidByUserId };
    try {
        const [result] = await db.query('INSERT INTO payment_details SET ?', newDetails);
        res.status(201).json({ message: 'Payment details created successfully.', detailId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create payment details', error: error.message });
    }
});

// PUT to update a payment details record
router.put('/payment-details/:requestId', auth, privilege(['payment_details.update']), async (req, res) => {
    const { requestId } = req.params;
    const { paymentMode, bankName, accountNumber, transactionId, notes } = req.body;
    try {
        const [result] = await db.query('UPDATE payment_details SET paymentMode = ?, bankName = ?, accountNumber = ?, transactionId = ?, notes = ? WHERE requestId = ?', [paymentMode, bankName, accountNumber, transactionId, notes, requestId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Payment details not found.' });
        }
        res.json({ message: 'Payment details updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update payment details', error: error.message });
    }
});

// DELETE a payment details record
router.delete('/payment-details/:requestId', auth, privilege(['payment_details.delete']), async (req, res) => {
    const { requestId } = req.params;
    try {
        const [result] = await db.query('DELETE FROM payment_details WHERE requestId = ?', [requestId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Payment details not found.' });
        }
        res.json({ message: 'Payment details deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete payment details', error: error.message });
    }
});

// --- Routes for payment_approval_history ---

// GET a payment approval history for a requestId
router.get('/history/:requestId', auth, privilege(['payment_request.read']), async (req, res) => {
    const { requestId } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM payment_approval_history WHERE requestId = ? ORDER BY actionDate ASC', [requestId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch payment approval history', error: error.message });
    }
});


module.exports = router;