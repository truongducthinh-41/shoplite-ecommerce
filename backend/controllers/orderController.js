const pool = require('../config/db');

const checkout = async (req, res) => {
  const { cartItems } = req.body; // Array of { product_id, quantity }
  const userId = req.userId;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const productIds = cartItems.map(item => item.product_id);
  const quantities = cartItems.map(item => item.quantity);

  try {
    // We call the stored procedure sp_checkout
    // It takes p_user_id, p_product_ids array, p_quantities array
    const query = 'CALL sp_checkout($1, $2, $3, null)';
    const result = await pool.query(query, [userId, productIds, quantities]);
    
    // In PostgreSQL CALL statements with OUT parameters return the OUT parameter as a row
    const orderId = result.rows[0].p_order_id;
    
    res.json({ message: 'Checkout successful', orderId });
  } catch (error) {
    console.error(error);
    // Usually, the stored procedure throws an exception we can catch
    res.status(400).json({ error: error.message || 'Checkout failed due to insufficient stock or invalid products.' });
  }
};

module.exports = { checkout };
