const pool = require('../../config/db');

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

const getMyOrders = async (req, res) => {
  const userId = req.user ? req.user.id : req.userId; // authMiddleware sets req.user or req.userId depending on version
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const ordersResult = await pool.query(`
      SELECT id, created_at as order_date, total_amount, status 
      FROM Orders 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [userId]);

    const orders = ordersResult.rows;
    
    // For each order, fetch items if we want rich detail (or just return basic order list)
    // For now, basic order list is fine. We can join OrderDetails if needed.
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

module.exports = { checkout, getMyOrders };
