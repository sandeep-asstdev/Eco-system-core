const express = require('express');
const router = express.Router();
const { downloadFile } = require('./fileController');
const authenticate = require('../../middleware/auth');

// Protected download endpoint: verifies session and tenant access
router.get('/:tenantId/:category/:filename', authenticate, downloadFile);

module.exports = router;
