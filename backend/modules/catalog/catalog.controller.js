const pool = require('../../config/db');

// 1. Lấy danh sách sản phẩm với bộ lọc chuyên nghiệp (Hỗ trợ Category, Brand, Shop, Sort, Search, Price)
const getProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 24;
  const offset = parseInt(req.query.offset) || 0;
  const category = req.query.category || 'All';
  const brand = req.query.brand;
  const shopId = req.query.shop_id;
  const sort = req.query.sort || 'Popularity';
  const search = req.query.search || '';
  
  try {
    let query = `
      SELECT 
        p.id,
        p.sku,
        p.name,
        p.description,
        p.price,
        p.original_price,
        ROUND(((p.original_price - p.price) / p.original_price * 100), 0) AS discount_percent,
        p.stock,
        p.sold_count,
        p.rating_avg,
        p.review_count,
        p.image_url,
        p.status,
        s.id AS shop_id,
        s.name AS shop_name,
        s.slug AS shop_slug,
        s.is_official AS shop_is_official,
        c.id AS category_id,
        c.name AS category_name,
        b.id AS brand_id,
        b.name AS brand_name,
        b.logo_url AS brand_logo
      FROM Products p
      JOIN Shops s ON p.shop_id = s.id
      JOIN Categories c ON p.category_id = c.id
      LEFT JOIN Brands b ON p.brand_id = b.id
      WHERE p.status = 'active'
    `;
    const params = [];
    
    // Lọc theo Danh mục (Hỗ trợ cả ID, Tên danh mục hoặc Slug, bao gồm cả danh mục con)
    if (category && category !== 'All') {
      if (!isNaN(parseInt(category))) {
        query += ` AND (p.category_id = $${params.length + 1} OR p.category_id IN (SELECT id FROM Categories WHERE parent_id = $${params.length + 1}))`;
        params.push(parseInt(category));
      } else {
        query += ` AND (
          c.name ILIKE $${params.length + 1} 
          OR c.slug ILIKE $${params.length + 1}
          OR p.category_id IN (
            SELECT id FROM Categories 
            WHERE parent_id IN (SELECT id FROM Categories WHERE name ILIKE $${params.length + 1} OR slug ILIKE $${params.length + 1})
          )
        )`;
        params.push(category);
      }
    }

    // Lọc theo Thương hiệu (Hỗ trợ cả brand đơn lẻ hoặc brands phân cách bằng dấu phẩy)
    const brandParam = req.query.brands || req.query.brand;
    if (brandParam) {
      const brandList = brandParam.split(',').map(b => b.trim()).filter(Boolean);
      if (brandList.length === 1 && !isNaN(parseInt(brandList[0]))) {
        query += ` AND p.brand_id = $${params.length + 1}`;
        params.push(parseInt(brandList[0]));
      } else if (brandList.length > 0) {
        const brandClauses = brandList.map(b => {
          params.push(`%${b}%`);
          return `b.name ILIKE $${params.length}`;
        });
        query += ` AND (${brandClauses.join(' OR ')})`;
      }
    }

    // Lọc theo Subcategory (Hỗ trợ từ FilterSidebar)
    const subcategory = req.query.subcategory;
    if (subcategory) {
      query += ` AND (p.name ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1} OR c.name ILIKE $${params.length + 1})`;
      params.push(`%${subcategory}%`);
    }

    // Lọc theo Gian hàng (Shop ID)
    if (shopId) {
      query += ` AND p.shop_id = $${params.length + 1}`;
      params.push(parseInt(shopId));
    }

    // Tìm kiếm theo từ khóa (Tìm cả tên sản phẩm, tên shop, tên thương hiệu)
    if (search) {
      query += ` AND (p.name ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1} OR b.name ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    // Lọc khoảng giá
    const minPrice = parseFloat(req.query.minPrice);
    if (!isNaN(minPrice)) {
      query += ` AND p.price >= $${params.length + 1}`;
      params.push(minPrice);
    }

    const maxPrice = parseFloat(req.query.maxPrice);
    if (!isNaN(maxPrice)) {
      query += ` AND p.price <= $${params.length + 1}`;
      params.push(maxPrice);
    }

    // Lọc xếp hạng sao đánh giá
    const rating = parseFloat(req.query.rating);
    if (!isNaN(rating) && rating > 0) {
      query += ` AND p.rating_avg >= $${params.length + 1}`;
      params.push(rating);
    }
    
    // Sắp xếp
    if (sort === 'Price: Low to High') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'Price: High to Low') {
      query += ' ORDER BY p.price DESC';
    } else if (sort === 'Newest') {
      query += ' ORDER BY p.created_at DESC';
    } else if (sort === 'Top Sales') {
      query += ' ORDER BY p.sold_count DESC, p.id ASC';
    } else {
      query += ' ORDER BY p.sold_count DESC, p.rating_avg DESC, p.id ASC'; // Popularity default
    }
    
    // Phân trang
    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;
    query += ` LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('[Catalog getProducts Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 2. Lấy chi tiết sản phẩm kèm thông tin Shop, Brand, Breadcrumb và Đánh giá
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const productQuery = `
      SELECT 
        p.*,
        ROUND(((p.original_price - p.price) / p.original_price * 100), 0) AS discount_percent,
        s.name AS shop_name,
        s.slug AS shop_slug,
        s.is_official AS shop_is_official,
        s.rating AS shop_rating,
        s.logo_url AS shop_logo,
        c.name AS category_name,
        c.slug AS category_slug,
        b.name AS brand_name,
        b.slug AS brand_slug,
        b.logo_url AS brand_logo,
        b.origin_country AS brand_country
      FROM Products p
      JOIN Shops s ON p.shop_id = s.id
      JOIN Categories c ON p.category_id = c.id
      LEFT JOIN Brands b ON p.brand_id = b.id
      WHERE p.id = $1
    `;
    const result = await pool.query(productQuery, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    const product = result.rows[0];

    // Lấy đường dẫn phân cấp Breadcrumb bằng Recursive CTE function
    try {
      const breadcrumbRes = await pool.query('SELECT full_path FROM fn_get_category_path($1)', [product.category_id]);
      if (breadcrumbRes.rows.length > 0) {
        product.category_path = breadcrumbRes.rows[0].full_path;
      }
    } catch (e) {
      product.category_path = product.category_name;
    }

    // Lấy các đánh giá của sản phẩm
    const reviewsRes = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name, u.avatar_url
       FROM Reviews r
       JOIN Users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );
    product.reviews = reviewsRes.rows;

    res.json(product);
  } catch (error) {
    console.error('[Catalog getProductById Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 3. Lấy cây Danh mục sản phẩm (Hỗ trợ phân cấp Cha - Con)
const getCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.parent_id, 
        c.name, 
        c.slug, 
        c.icon_name, 
        c.description,
        COUNT(DISTINCT p.id) AS product_count
      FROM Categories c
      LEFT JOIN Products p ON c.id = p.category_id
      GROUP BY c.id, c.parent_id, c.name, c.slug, c.icon_name, c.description
      ORDER BY c.parent_id NULLS FIRST, c.id ASC
    `);

    // Tách thành danh mục cha và các danh mục con
    const all = result.rows;
    const parents = all.filter(c => c.parent_id === null);
    const tree = parents.map(p => ({
      ...p,
      children: all.filter(c => c.parent_id === p.id)
    }));

    res.json(tree);
  } catch (error) {
    console.error('[Catalog getCategories Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 4. Lấy các thương hiệu nổi tiếng nhất thế giới tương ứng với từng Danh mục
const getCategoryBrands = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT b.id, b.name, b.slug, b.logo_url, b.origin_country, b.description
       FROM Brands b
       JOIN Category_Brands cb ON b.id = cb.brand_id
       WHERE cb.category_id = $1 OR cb.category_id IN (SELECT parent_id FROM Categories WHERE id = $1)
       ORDER BY b.name ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('[Catalog getCategoryBrands Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 5. Lấy danh sách toàn bộ các thương hiệu lớn toàn cầu
const getAllBrands = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, COUNT(DISTINCT p.id) AS product_count
      FROM Brands b
      LEFT JOIN Products p ON b.id = p.brand_id
      GROUP BY b.id
      ORDER BY b.name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('[Catalog getAllBrands Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 5.1. Lấy danh sách sản phẩm theo Thương hiệu qua Table-Valued Function (TVF)
const getProductsByBrandTVF = async (req, res) => {
  const { brandId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM fn_get_products_by_brand($1)', [brandId]);
    res.json(result.rows);
  } catch (error) {
    console.error('[Catalog getProductsByBrandTVF Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 5.2. Lấy đường dẫn phân cấp danh mục (Breadcrumb) qua Recursive CTE TVF
const getCategoryPath = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM fn_get_category_path($1)', [id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('[Catalog getCategoryPath Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 6. Đăng sản phẩm mới (Dành cho Người bán hàng - Seller)
const createProduct = async (req, res) => {
  const { 
    category_id, 
    brand_id, 
    name, 
    description, 
    price, 
    original_price, 
    stock = 0, 
    image_url, 
    sku 
  } = req.body;

  try {
    // 1. Xác định shop_id của Seller
    let shopId = req.shopId;
    if (!shopId) {
      const shopRes = await pool.query('SELECT id FROM Shops WHERE owner_id = $1', [req.userId]);
      if (shopRes.rows.length === 0) {
        return res.status(403).json({ error: 'Bạn cần mở Gian hàng (Shop) trước khi đăng bán sản phẩm.' });
      }
      shopId = shopRes.rows[0].id;
    }

    // 2. Validate dữ liệu đầu vào chuẩn hóa
    if (!name || !price || !category_id || !image_url) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ tên, giá, danh mục và hình ảnh sản phẩm.' });
    }

    const finalSku = sku || `SKU-${shopId}-${Date.now().toString(36).toUpperCase()}`;
    const finalOriginalPrice = original_price && parseFloat(original_price) >= parseFloat(price) 
      ? parseFloat(original_price) 
      : parseFloat(price);

    const insertQuery = `
      INSERT INTO Products (
        shop_id, 
        category_id, 
        brand_id, 
        sku, 
        name, 
        description, 
        price, 
        original_price, 
        stock, 
        image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      shopId,
      category_id,
      brand_id || null,
      finalSku,
      name,
      description || '',
      parseFloat(price),
      finalOriginalPrice,
      parseInt(stock) || 0,
      image_url
    ]);

    res.status(201).json({ 
      message: 'Đăng sản phẩm lên sàn thành công!', 
      product: result.rows[0] 
    });
  } catch (error) {
    console.error('[Catalog createProduct Error]:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Mã SKU sản phẩm đã tồn tại, vui lòng đổi mã khác' });
    }
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng sản phẩm' });
  }
};

// 7. Sửa sản phẩm (Seller chỉ được sửa sản phẩm thuộc shop của mình, Admin sửa được tất cả)
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, original_price, stock, image_url, category_id, brand_id, status } = req.body;

  try {
    // Kiểm tra quyền sở hữu sản phẩm
    const checkQuery = `
      SELECT p.id, p.shop_id, s.owner_id 
      FROM Products p 
      JOIN Shops s ON p.shop_id = s.id 
      WHERE p.id = $1
    `;
    const checkRes = await pool.query(checkQuery, [id]);
    if (checkRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });

    const prod = checkRes.rows[0];
    if (req.userRole !== 'admin' && prod.owner_id !== req.userId) {
      return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa sản phẩm này!' });
    }

    const updateQuery = `
      UPDATE Products 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        original_price = COALESCE($4, original_price),
        stock = COALESCE($5, stock),
        image_url = COALESCE($6, image_url),
        category_id = COALESCE($7, category_id),
        brand_id = COALESCE($8, brand_id),
        status = COALESCE($9, status)
      WHERE id = $10
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      name, description, price, original_price, stock, image_url, category_id, brand_id, status, id
    ]);

    res.json({ message: 'Cập nhật sản phẩm thành công', product: result.rows[0] });
  } catch (error) {
    console.error('[Catalog updateProduct Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 8. Xóa sản phẩm
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const checkQuery = `
      SELECT p.id, s.owner_id 
      FROM Products p 
      JOIN Shops s ON p.shop_id = s.id 
      WHERE p.id = $1
    `;
    const checkRes = await pool.query(checkQuery, [id]);
    if (checkRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });

    if (req.userRole !== 'admin' && checkRes.rows[0].owner_id !== req.userId) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa sản phẩm này!' });
    }

    await pool.query('DELETE FROM Products WHERE id = $1', [id]);
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    console.error('[Catalog deleteProduct Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 9. Lấy Top sản phẩm bán chạy nhất sàn
const getBestSellers = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.original_price, 
        p.sold_count, 
        p.rating_avg, 
        p.image_url,
        s.name AS shop_name,
        s.is_official AS shop_is_official,
        b.name AS brand_name
      FROM Products p
      JOIN Shops s ON p.shop_id = s.id
      LEFT JOIN Brands b ON p.brand_id = b.id
      WHERE p.status = 'active'
      ORDER BY p.sold_count DESC, p.rating_avg DESC
      LIMIT 8
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('[Catalog getBestSellers Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 10. AI Recommendation Engine: Mua cùng nhau (Co-occurrence)
const getProductRecommendations = async (req, res) => {
  const { id } = req.params;
  try {
    const coOccurrenceQuery = `
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.original_price, 
        p.image_url, 
        p.rating_avg,
        s.name AS shop_name,
        COUNT(od2.product_id) as frequency
      FROM OrderDetails od1
      JOIN OrderDetails od2 ON od1.order_id = od2.order_id AND od1.product_id != od2.product_id
      JOIN Products p ON od2.product_id = p.id
      JOIN Shops s ON p.shop_id = s.id
      WHERE od1.product_id = $1 AND p.status = 'active'
      GROUP BY p.id, p.name, p.price, p.original_price, p.image_url, p.rating_avg, s.name
      ORDER BY frequency DESC
      LIMIT 5
    `;
    const result = await pool.query(coOccurrenceQuery, [id]);
    
    if (result.rows.length > 0) {
      return res.json({ type: 'co-occurrence', recommendations: result.rows });
    }

    // Fallback: Sản phẩm cùng danh mục
    const targetProductResult = await pool.query('SELECT category_id, price FROM Products WHERE id = $1', [id]);
    if (targetProductResult.rows.length === 0) return res.status(404).json({ error: 'Target product not found' });
    
    const target = targetProductResult.rows[0];
    const fallbackQuery = `
      SELECT p.id, p.name, p.price, p.original_price, p.image_url, p.rating_avg, s.name AS shop_name
      FROM Products p
      JOIN Shops s ON p.shop_id = s.id
      WHERE p.category_id = $1 AND p.id != $2 AND p.status = 'active'
      ORDER BY p.sold_count DESC
      LIMIT 5
    `;
    
    const fallbackResult = await pool.query(fallbackQuery, [target.category_id, id]);
    res.json({ type: 'category-based', recommendations: fallbackResult.rows });
  } catch (error) {
    console.error('[Catalog getProductRecommendations Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  getCategoryBrands,
  getAllBrands,
  getProductsByBrandTVF,
  getCategoryPath,
  createProduct,
  updateProduct,
  deleteProduct,
  getBestSellers,
  getProductRecommendations
};
