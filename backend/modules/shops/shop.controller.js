const pool = require('../../config/db');

// 1. Tạo mới gian hàng (Dành cho User muốn nâng cấp làm Seller hoặc Seller chưa có Shop)
const createShop = async (req, res) => {
  const { name, description, logo_url, banner_url } = req.body;
  const ownerId = req.userId;

  if (!name) return res.status(400).json({ error: 'Tên gian hàng không được để trống' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Kiểm tra xem user đã có shop chưa
    const existing = await client.query('SELECT id FROM Shops WHERE owner_id = $1', [ownerId]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Bạn đã sở hữu một gian hàng rồi!' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

    // Cập nhật role của user thành 'seller' nếu đang là 'customer'
    await client.query("UPDATE Users SET role = 'seller' WHERE id = $1 AND role = 'customer'", [ownerId]);

    // Tạo shop
    const shopResult = await client.query(
      `INSERT INTO Shops (owner_id, name, slug, description, logo_url, banner_url, is_official) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [ownerId, name, slug, description || '', logo_url || null, banner_url || null, false]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Tạo gian hàng thành công!', shop: shopResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Create Shop Error]:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Tên gian hàng hoặc đường dẫn đã tồn tại' });
    }
    res.status(500).json({ error: 'Lỗi hệ thống khi tạo gian hàng' });
  } finally {
    client.release();
  }
};

// 2. Lấy thông tin Shop của Seller đang đăng nhập (My Shop)
const getMyShop = async (req, res) => {
  try {
    const shopResult = await pool.query(
      `SELECT s.*, 
        COUNT(DISTINCT p.id) AS total_products,
        COALESCE(SUM(p.sold_count), 0) AS total_sold_items
       FROM Shops s
       LEFT JOIN Products p ON s.id = p.shop_id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [req.userId]
    );

    if (shopResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bạn chưa tạo gian hàng bán hàng.' });
    }

    res.json(shopResult.rows[0]);
  } catch (error) {
    console.error('[Get My Shop Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 3. Lấy thông tin công khai của Shop theo ID hoặc Slug (Khách hàng xem)
const getShopById = async (req, res) => {
  const { id } = req.params;
  try {
    const shopResult = await pool.query(
      `SELECT s.*, 
        u.name as owner_name,
        COUNT(DISTINCT p.id) AS total_products,
        COALESCE(SUM(p.sold_count), 0) AS total_sold_items
       FROM Shops s
       JOIN Users u ON s.owner_id = u.id
       LEFT JOIN Products p ON s.id = p.shop_id
       WHERE s.id::text = $1 OR s.slug = $1
       GROUP BY s.id, u.name`,
      [id]
    );

    if (shopResult.rows.length === 0) {
      return res.status(404).json({ error: 'Gian hàng không tồn tại' });
    }

    res.json(shopResult.rows[0]);
  } catch (error) {
    console.error('[Get Shop By ID Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 4. Lấy danh sách sản phẩm thuộc gian hàng của Seller
const getShopProducts = async (req, res) => {
  const { id } = req.params;
  try {
    const productsResult = await pool.query(
      `SELECT p.*, c.name as category_name, b.name as brand_name
       FROM Products p
       JOIN Categories c ON p.category_id = c.id
       LEFT JOIN Brands b ON p.brand_id = b.id
       WHERE p.shop_id::text = $1
       ORDER BY p.id DESC`,
      [id]
    );

    res.json(productsResult.rows);
  } catch (error) {
    console.error('[Get Shop Products Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 5. Seller xem các đơn hàng liên quan đến sản phẩm của shop mình
const getShopOrders = async (req, res) => {
  try {
    // Tìm shop_id của user hiện tại
    const shopRes = await pool.query('SELECT id FROM Shops WHERE owner_id = $1', [req.userId]);
    if (shopRes.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy gian hàng của bạn' });
    }
    const shopId = shopRes.rows[0].id;

    const ordersResult = await pool.query(
      `SELECT 
        o.id AS order_id,
        o.created_at,
        o.status AS order_status,
        o.shipping_address,
        u.name AS customer_name,
        u.email AS customer_email,
        od.product_id,
        p.name AS product_name,
        p.image_url AS product_image,
        od.quantity,
        od.price_at_purchase,
        (od.quantity * od.price_at_purchase) AS item_total
       FROM OrderDetails od
       JOIN Orders o ON od.order_id = o.id
       JOIN Users u ON o.user_id = u.id
       JOIN Products p ON od.product_id = p.id
       WHERE od.shop_id = $1
       ORDER BY o.created_at DESC`,
      [shopId]
    );

    res.json(ordersResult.rows);
  } catch (error) {
    console.error('[Get Shop Orders Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  createShop,
  getMyShop,
  getShopById,
  getShopProducts,
  getShopOrders
};

