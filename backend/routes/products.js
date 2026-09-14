const express = require('express');
const { getProducts, getProductById, getProductRecommendations, getBestSellers } = require('../controllers/productController');
const router = express.Router();

router.get('/', getProducts);
router.get('/bestsellers', getBestSellers);
router.get('/:id', getProductById);
router.get('/:id/recommendations', getProductRecommendations);

module.exports = router;
