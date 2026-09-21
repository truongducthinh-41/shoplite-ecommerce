const express = require('express');
const { checkout, getMyOrders } = require('./order.controller');
const { verifyToken } = require('../../middleware/authMiddleware');
const router = express.Router();

// Require user to be logged in to checkout
router.post('/checkout', verifyToken, checkout);
router.get('/myorders', verifyToken, getMyOrders);

module.exports = router;
