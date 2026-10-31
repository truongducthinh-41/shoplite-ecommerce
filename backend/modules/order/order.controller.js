const pool = require('../../config/db');

const checkout = async (req, res) => {
  const { cartItems, shipping_address = 'Địa chỉ mặc định, TP.HCM' } = req.body;
  const userId = req.userId;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Giỏ hàng của bạn đang trống!' });
  }

  const productIds = cartItems.map(item => item.product_id || item.id);
  const quantities = cartItems.map(item => item.quantity);

  try {
    // Gọi Stored Procedure sp_checkout thực thi ACID transaction & khóa dòng FOR UPDATE
    const query = 'CALL sp_checkout($1, $2, $3, $4, null)';
    const result = await pool.query(query, [userId, productIds, quantities, shipping_address]);
    
    const orderId = result.rows[0].p_order_id;
    
    res.json({ 
      message: 'Đặt hàng thành công!', 
      orderId 
    });
  } catch (error) {
    console.error('[Checkout Error]:', error);
    res.status(400).json({ 
      error: error.message || 'Thanh toán thất bại do sản phẩm hết hàng hoặc số lượng không hợp lệ.' 
    });
  }
};

const getMyOrders = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const ordersResult = await pool.query(`
      SELECT 
        o.id, 
        o.created_at, 
        o.total_amount, 
        o.shipping_address,
        o.payment_method,
        o.status,
        json_agg(
          json_build_object(
            'product_id', p.id,
            'product_name', p.name,
            'image_url', p.image_url,
            'shop_id', s.id,
            'shop_name', s.name,
            'quantity', od.quantity,
            'price_at_purchase', od.price_at_purchase
          )
        ) AS items
      FROM Orders o
      JOIN OrderDetails od ON o.id = od.order_id
      JOIN Products p ON od.product_id = p.id
      JOIN Shops s ON od.shop_id = s.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId]);

    res.json(ordersResult.rows);
  } catch (error) {
    console.error('[Get My Orders Error]:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

module.exports = { checkout, getMyOrders };
