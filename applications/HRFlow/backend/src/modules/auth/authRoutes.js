const express = require('express');
const router = express.Router();
const { login, register, getCurrentUser, demoSwitch } = require('./authController');
const authenticate = require('../../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.post('/demo-switch', demoSwitch);
router.get('/me', authenticate, getCurrentUser);

module.exports = router;
