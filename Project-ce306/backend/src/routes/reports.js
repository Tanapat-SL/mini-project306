const router = require('express').Router();
const pool = require('../config/db');
const { authenticateJWT } = require('../middleware/auth');

// GET /api/reports
router.get('/', authenticateJWT, async (req, res) => {
    try {
        let sql = 'SELECT r.*, u.username FROM repair_reports r JOIN users u ON r.user_id = u.id';
        let values = [];
        if (req.user.role === 'user') {
            sql += ' WHERE r.user_id = $1';
            values = [req.user.id];
        }
        sql += ' ORDER BY r.id DESC';
        const result = await pool.query(sql, values);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/reports
router.post('/', authenticateJWT, async (req, res) => {
    const { title, description, image_url } = req.body;
    try {
        await pool.query(
            'INSERT INTO repair_reports (user_id, title, description, image_url) VALUES ($1, $2, $3, $4)',
            [req.user.id, title, description, image_url || null]
        );
        res.json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/reports/:id
router.put('/:id', authenticateJWT, async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query('UPDATE repair_reports SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
