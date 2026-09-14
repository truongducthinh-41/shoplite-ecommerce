const express = require('express');
const { checkout } = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Require user to be logged in to checkout
router.post('/checkout', verifyToken, checkout);

module.exports = router;
