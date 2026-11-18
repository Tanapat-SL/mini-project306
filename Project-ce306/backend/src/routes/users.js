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
// DELETE /api/users/:id (ลบผู้ใช้ โดยบังคับให้เหลือ admin อย่างน้อย 1 บัญชี)
router.delete('/:id', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถลบบัญชีได้' });
    }

    try {
        // 1. ตรวจสอบว่าบัญชีที่จะลบมีอยู่จริงหรือไม่ และมีสิทธิ์เป็นอะไร
        const targetResult = await pool.query('SELECT id, role FROM users WHERE id = $1', [req.params.id]);
        if (targetResult.rows.length === 0) {
            return res.status(404).json({ error: 'ไม่พบบัญชีผู้ใช้งาน' });
        }

        // 2. หากบัญชีที่จะลบเป็น admin ให้เช็กว่าเหลือ admin กี่คนในระบบ
        if (targetResult.rows[0].role === 'admin') {
            const adminCountResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
            const adminCount = Number(adminCountResult.rows[0].count);

            if (adminCount <= 1) {
                return res.status(400).json({
                    error: 'ไม่สามารถลบได้ ต้องเหลือบัญชี Admin อย่างน้อย 1 บัญชีในระบบ',
                    message: 'ไม่สามารถลบได้ ต้องเหลือบัญชี Admin อย่างน้อย 1 บัญชีในระบบ'
                });
            }
        }

        // 3. ดำเนินการลบ
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'ลบบัญชีผู้ใช้งานสำเร็จ' });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({
                error: 'ไม่สามารถลบได้ เนื่องจากบัญชีนี้ยังมีประวัติการแจ้งซ่อมค้างอยู่ในระบบ',
                message: 'ไม่สามารถลบได้ เนื่องจากบัญชีนี้ยังมีประวัติการแจ้งซ่อมค้างอยู่ในระบบ'
            });
        }
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
