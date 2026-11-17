const router = require('express').Router();
const pool = require('../config/db');
const { authenticateJWT, requireAdmin } = require('../middleware/auth');

// ทุก route ในไฟล์นี้ต้องเป็น admin
router.use(authenticateJWT, requireAdmin);

// GET /api/members
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM room_members ORDER BY room_number ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/members
router.post('/', async (req, res) => {
    const { room_number, full_name, phone, image_url } = req.body;
    try {
        await pool.query(
            'INSERT INTO room_members (room_number, full_name, phone, image_url) VALUES ($1, $2, $3, $4)',
            [room_number, full_name, phone, image_url || null]
        );
        res.json({ message: 'Member added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/members/:id
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM room_members WHERE id = $1', [req.params.id]);
        res.json({ message: 'Member deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
