const express = require('express');
const { chatWithAI } = require('./ai.controller');

const router = express.Router();

// Endpoint chat với trợ lý mua sắm AI
router.post('/chat', chatWithAI);

module.exports = router;
