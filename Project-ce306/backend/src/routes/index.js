const router = require('express').Router();

router.use('/login', require('./auth')); // หรือชื่อไฟล์ login เดิมของคุณ
router.use('/reports', require('./reports'));
router.use('/members', require('./members'));
router.use('/users', require('./users'));
router.use('/announcements', require('./announcements'));
router.use('/bills', require('./bills'));

module.exports = router;
