const router = require('express').Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { secretKey } = require('../config');

// POST /api/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: '1h' });
            res.json({ token, role: user.role });
        } else {
            res.status(401).json({ message: 'Login failed' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
