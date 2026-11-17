const router = require('express').Router();
const pool = require('../config/db');
const { authenticateJWT, requireAdmin } = require('../middleware/auth');

// สร้างตาราง announcements อัตโนมัติถ้ายังไม่มีในฐานข้อมูล
const ensureTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS announcements (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};

// GET /api/announcements
router.get('/', authenticateJWT, async (req, res) => {
    try {
        await ensureTable();
        const result = await pool.query(`
            SELECT id, title, content,
            TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') AS date
            FROM announcements
            ORDER BY id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/announcements (เฉพาะแอดมิน)
router.post('/', authenticateJWT, requireAdmin, async (req, res) => {
    const { title, content } = req.body;
    try {
        await ensureTable();
        await pool.query(
            'INSERT INTO announcements (title, content) VALUES ($1, $2)',
            [title, content]
        );
        res.json({ message: 'Announcement created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/announcements/:id (เฉพาะแอดมิน)
router.delete('/:id', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        await ensureTable();
        await pool.query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
        res.json({ message: 'Announcement deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;