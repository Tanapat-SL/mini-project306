const router = require('express').Router();
const pool = require('../config/db');
const { authenticateJWT, requireAdmin } = require('../middleware/auth');

// จัดการบัญชีผู้ใช้งาน (เฉพาะ admin)
router.use(authenticateJWT, requireAdmin);

// GET /api/users  (ไม่ส่งรหัสผ่านกลับ)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, role FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/users
router.post('/', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const check = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: 'ชื่อผู้ใช้นี้มีในระบบแล้ว' });
        }
        await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
            [username, password, role || 'user']
        );
        res.json({ message: 'Account created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
    try {
        if (req.params.id == req.user.id) {
            return res.status(400).json({ message: 'ไม่สามารถลบบัญชีของตัวเองได้' });
        }
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        // ลบไม่ได้เพราะผู้ใช้นี้เคยแจ้งซ่อม (ติด Foreign Key)
        if (err.code === '23503') {
            res.status(400).json({ message: 'ไม่สามารถลบได้ เนื่องจากบัญชีนี้มีประวัติการแจ้งซ่อมในระบบ' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

module.exports = router;
