const pool = require('../../config/db');

// Get reviews for a product
const getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const query = `
      SELECT r.id, r.rating, r.comment, r.created_at, u.name as username 
      FROM Reviews r
      JOIN Users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [productId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    // Return empty array if table doesn't exist or error
    res.json([]);
  }
};

// Add a new review
const addReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.userId || (req.user && req.user.id); // From authMiddleware

  if (!rating) {
    return res.status(400).json({ error: 'Rating is required' });
  }

  try {
    const query = `
      INSERT INTO Reviews (product_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [productId, userId, rating, comment]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add review' });
  }
};

module.exports = { getReviewsByProduct, addReview };
