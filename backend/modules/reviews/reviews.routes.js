const express = require('express');
const { getReviewsByProduct, addReview } = require('./reviews.controller');
const { verifyToken } = require('../../middleware/authMiddleware');
const router = express.Router();

router.get('/product/:productId', getReviewsByProduct);
router.post('/product/:productId', verifyToken, addReview);

module.exports = router;
