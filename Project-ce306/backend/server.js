const app = require('./src/app');
const { port } = require('./src/config');

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
// 1. ลบรายการแจ้งซ่อม
app.delete('/api/reports/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM reports WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'ไม่พบรายการแจ้งซ่อม' });
        res.json({ message: 'ลบรายการแจ้งซ่อมสำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }
});

// 2. ลบบิลค่าเช่า
app.delete('/api/bills/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM bills WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'ไม่พบบิลค่าเช่า' });
        res.json({ message: 'ลบบิลสำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบบิล' });
    }
});

// 3. ลบประกาศ
app.delete('/api/announcements/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'ไม่พบประกาศ' });
        res.json({ message: 'ลบประกาศสำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบประกาศ' });
    }
});

// 4. ลบบัญชีผู้พักอาศัย / ผู้ใช้ (ป้องกันแอดมินลบบัญชีตัวเอง)
app.delete('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        if (Number(req.params.id) === Number(req.user.id)) {
            return res.status(400).json({ error: 'ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้' });
        }
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'ไม่พบบัญชีผู้ใช้' });
        res.json({ message: 'ลบบัญชีผู้ใช้สำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: 'ไม่สามารถลบได้ เนื่องจากผู้ใช้นี้ยังมีข้อมูลบิลหรือรายการแจ้งซ่อมค้างอยู่' });
    }
});