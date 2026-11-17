const router = require('express').Router();

router.use('/', require('./auth'));            // /api/login
router.use('/reports', require('./reports'));  // /api/reports
router.use('/members', require('./members'));  // /api/members
router.use('/users', require('./users'));      // /api/users

module.exports = router;
