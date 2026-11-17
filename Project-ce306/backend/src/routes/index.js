const router = require('express').Router();

router.use('/', require('./auth'));
router.use('/reports', require('./reports'));
router.use('/members', require('./members'));
router.use('/users', require('./users'));
router.use('/announcements', require('./announcements'));
router.use('/bills', require('./bills'));

module.exports = router;
