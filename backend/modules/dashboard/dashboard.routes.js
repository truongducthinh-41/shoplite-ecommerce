const express = require('express');
const { getDashboardSummary } = require('./dashboard.controller');
const { verifyToken, isAdmin } = require('../../middleware/authMiddleware');
const router = express.Router();

// Require valid token AND Admin role
router.get('/dashboard', verifyToken, isAdmin, getDashboardSummary);

module.exports = router;
