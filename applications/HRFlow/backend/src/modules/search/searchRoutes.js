const express = require('express');
const router = express.Router();
const { globalSearch } = require('./searchController');
const authenticate = require('../../middleware/auth');
const { enforceTenantScope } = require('../../middleware/tenantAuth');

router.use(authenticate);
router.use(enforceTenantScope);

router.get('/', globalSearch);

module.exports = router;
