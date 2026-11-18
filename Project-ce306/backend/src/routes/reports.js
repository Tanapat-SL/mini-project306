const router = require('express').Router();
const pool = require('../config/db');
const { authenticateJWT } = require('../middleware/auth');

// GET /api/reports
router.get('/', authenticateJWT, async (req, res) => {
    try {
        // ตรวจสอบว่าบัญชียังมีอยู่ในระบบหรือไม่
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [req.user.id]);
        if (userCheck.rows.length === 0) {
            return res.status(401).json({ error: 'ไม่พบบัญชีผู้ใช้งาน' });
        }

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

// DELETE /api/reports/:id (เฉพาะแอดมิน)
router.delete('/:id', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถลบรายการได้' });
    }
    try {
        const result = await pool.query('DELETE FROM repair_reports WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'ไม่พบรายการแจ้งซ่อมที่ต้องการลบ' });
        }
        res.json({ message: 'ลบรายการแจ้งซ่อมสำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;