const express = require('express');
const { getProducts, getProductById, getProductRecommendations, getBestSellers } = require('./catalog.controller');
const { cacheMiddleware } = require('../../config/redis');
const router = express.Router();

router.get('/', cacheMiddleware('catalog:products', 300), getProducts);
router.get('/bestsellers', cacheMiddleware('catalog:bestsellers', 3600), getBestSellers);
router.get('/:id', cacheMiddleware('catalog:product', 3600), getProductById);
router.get('/:id/recommendations', cacheMiddleware('catalog:recommendations', 3600), getProductRecommendations);

module.exports = router;
