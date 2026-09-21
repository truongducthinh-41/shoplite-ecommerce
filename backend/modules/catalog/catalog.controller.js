const pool = require('../../config/db');

const getProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const category = req.query.category || 'All';
  const sort = req.query.sort || 'Popularity';
  const search = req.query.search || '';
  
  try {
    let query = 'SELECT * FROM Products WHERE 1=1';
    const params = [];
    
    // Add category filter (dynamic from DB)
    if (category !== 'All') {
      query += ` AND category_id = (SELECT id FROM Categories WHERE name = $${params.length + 1})`;
      params.push(category);
    }

    // Add search filter
    if (search) {
      query += ` AND name ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }
    
    // Add sorting
    if (sort === 'Price: Low to High') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'Price: High to Low') {
      query += ' ORDER BY price DESC';
    } else {
      query += ' ORDER BY id ASC'; // Popularity default
    }
    
    // Add pagination
    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;
    query += ` LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get product details
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Products WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    const product = result.rows[0];
    
    // Fetch multiple images
    const imagesResult = await pool.query('SELECT image_url FROM Product_Images WHERE product_id = $1 ORDER BY display_order ASC', [id]);
    if (imagesResult.rows.length > 0) {
      product.images = imagesResult.rows.map(row => row.image_url);
    } else {
      product.images = [product.image_url];
    }
    
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};

// AI Recommendation Engine
// Algorithm 1: Frequently Bought Together (Co-occurrence)
// Fallback Algorithm: Same Category, Similar Price
const getProductRecommendations = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Try to get co-occurrences:
    // Find other products bought in the same orders as this product
    const coOccurrenceQuery = `
      SELECT p.id, p.name, p.price, p.image_url, COUNT(od2.product_id) as frequency
      FROM OrderDetails od1
      JOIN OrderDetails od2 ON od1.order_id = od2.order_id AND od1.product_id != od2.product_id
      JOIN Products p ON od2.product_id = p.id
      WHERE od1.product_id = $1
      GROUP BY p.id, p.name, p.price, p.image_url
      ORDER BY frequency DESC
      LIMIT 5
    `;
    const result = await pool.query(coOccurrenceQuery, [id]);
    
    if (result.rows.length > 0) {
      return res.json({ type: 'co-occurrence', recommendations: result.rows });
    }

    // 2. Fallback: Content-based (Same category, similar price +/- 50%)
    const targetProductResult = await pool.query('SELECT category_id, price FROM Products WHERE id = $1', [id]);
    if (targetProductResult.rows.length === 0) return res.status(404).json({ error: 'Target product not found' });
    
    const target = targetProductResult.rows[0];
    const minPrice = parseFloat(target.price) * 0.5;
    const maxPrice = parseFloat(target.price) * 1.5;

    const fallbackQuery = `
      SELECT id, name, price, image_url
      FROM Products
      WHERE category_id = $1 
        AND id != $2 
        AND price BETWEEN $3 AND $4
      ORDER BY price ASC
      LIMIT 5
    `;
    
    const fallbackResult = await pool.query(fallbackQuery, [target.category_id, id, minPrice, maxPrice]);
    res.json({ type: 'content-based', recommendations: fallbackResult.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};

const getBestSellers = async (req, res) => {
  try {
    const query = `
      SELECT p.id, p.name, p.price, p.image_url, SUM(od.quantity) as total_sold
      FROM Products p
      JOIN OrderDetails od ON p.id = od.product_id
      GROUP BY p.id, p.name, p.price, p.image_url
      ORDER BY total_sold DESC
      LIMIT 4
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { getProducts, getProductById, getProductRecommendations, getBestSellers };
