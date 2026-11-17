const router = require('express').Router();
const pool = require('../config/db');
const { authenticateJWT, requireAdmin } = require('../middleware/auth');

const ensureTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS bills (
            id SERIAL PRIMARY KEY,
            room_number VARCHAR(50) NOT NULL,
            billing_month VARCHAR(50) NOT NULL,
            room_rent NUMERIC(10,2) DEFAULT 0,
            water_units NUMERIC(10,2) DEFAULT 0,
            water_rate NUMERIC(10,2) DEFAULT 18,
            electric_units NUMERIC(10,2) DEFAULT 0,
            electric_rate NUMERIC(10,2) DEFAULT 8,
            total_amount NUMERIC(10,2) NOT NULL,
            slip_url TEXT,
            status VARCHAR(50) NOT NULL DEFAULT 'รอชำระเงิน',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};

// GET /api/bills (แอดมินเห็นทุกห้อง / ผู้พักอาศัยเห็นเฉพาะห้องตัวเองตาม username)
router.get('/', authenticateJWT, async (req, res) => {
    try {
        await ensureTable();
        let sql = 'SELECT * FROM bills';
        let values = [];
        if (req.user.role !== 'admin') {
            sql += ' WHERE room_number = $1';
            values = [req.user.username];
        }
        sql += ' ORDER BY id DESC';
        const result = await pool.query(sql, values);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/bills (แอดมินออกบิลค่าเช่า-ค่าน้ำไฟ)
router.post('/', authenticateJWT, requireAdmin, async (req, res) => {
    const { room_number, billing_month, room_rent, water_units, water_rate, electric_units, electric_rate } = req.body;
    const rent = Number(room_rent) || 0;
    const wTotal = (Number(water_units) || 0) * (Number(water_rate) || 18);
    const eTotal = (Number(electric_units) || 0) * (Number(electric_rate) || 8);
    const total_amount = rent + wTotal + eTotal;

    try {
        await ensureTable();
        await pool.query(
            `INSERT INTO bills (room_number, billing_month, room_rent, water_units, water_rate, electric_units, electric_rate, total_amount)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [room_number, billing_month, rent, water_units || 0, water_rate || 18, electric_units || 0, electric_rate || 8, total_amount]
        );
        res.json({ message: 'ออกบิลเรียบร้อยแล้ว' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/bills/:id/slip (ผู้พักอาศัยแนบสลิปโอนเงิน)
router.put('/:id/slip', authenticateJWT, async (req, res) => {
    const { slip_url } = req.body;
    try {
        await ensureTable();
        await pool.query(
            "UPDATE bills SET slip_url = $1, status = 'รอตรวจสอบสลิป' WHERE id = $2",
            [slip_url, req.params.id]
        );
        res.json({ message: 'ส่งสลิปเรียบร้อยแล้ว' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/bills/:id/verify (แอดมินยืนยันการชำระเงินหรือให้ส่งสลิปใหม่)
router.put('/:id/verify', authenticateJWT, requireAdmin, async (req, res) => {
    const { status } = req.body; // 'ชำระแล้ว' หรือ 'สลิปไม่ถูกต้อง'
    try {
        await ensureTable();
        await pool.query('UPDATE bills SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ message: 'อัปเดตสถานะบิลเรียบร้อยแล้ว' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/bills/:id (แอดมินลบบิล)
router.delete('/:id', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM bills WHERE id = $1', [req.params.id]);
        res.json({ message: 'ลบบิลแล้ว' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;