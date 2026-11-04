const pool = require('../../config/db');

const getDashboardSummary = async (req, res) => {
  try {
    // 1. Lấy dữ liệu doanh thu theo ngày
    const salesResult = await pool.query(`
      SELECT 
        DATE(created_at) as sale_date, 
        COUNT(id) as total_orders, 
        SUM(total_amount) as daily_revenue
      FROM Orders 
      WHERE status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY sale_date DESC
      LIMIT 30
    `);
    
    // 2. Lấy sản phẩm sắp hết hàng (Low Stock)
    const lowStockResult = await pool.query(`
      SELECT p.id, p.name, p.stock, s.name as shop_name 
      FROM Products p 
      JOIN Shops s ON p.shop_id = s.id 
      WHERE p.stock < 30 
      ORDER BY p.stock ASC
      LIMIT 10
    `);
    
    // 3. Xếp hạng hiệu năng kinh doanh giữa các Shop bằng Window Function View (DENSE_RANK)
    const shopRankResult = await pool.query(`
      SELECT * FROM vw_shop_sales_performance ORDER BY revenue_rank ASC
    `);

    // 4. Báo cáo tăng trưởng doanh thu qua từng tháng dùng Window Functions (LAG, LEAD, Running Total)
    const monthlyGrowthResult = await pool.query(`
      SELECT * FROM vw_monthly_sales_growth ORDER BY sales_month DESC LIMIT 12
    `);

    // 5. Top sản phẩm bán chạy nhất trong từng danh mục (Window Function ROW_NUMBER & DENSE_RANK Partition)
    const topPerCategoryResult = await pool.query(`
      SELECT * FROM vw_top_selling_per_category WHERE row_num <= 3 ORDER BY category_id, rank_in_category ASC
    `);

    // 6. Chỉ số KPI toàn hệ thống
    const userCountResult = await pool.query('SELECT COUNT(*) FROM Users');
    const totalRevenueResult = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM Orders WHERE status != 'cancelled'");
    const orderCountResult = await pool.query('SELECT COUNT(*) FROM Orders');
    const shopCountResult = await pool.query('SELECT COUNT(*) FROM Shops');

    res.json({
      salesSummary: salesResult.rows,
      lowStockProducts: lowStockResult.rows,
      shopPerformance: shopRankResult.rows,
      monthlyGrowth: monthlyGrowthResult.rows,
      topPerCategory: topPerCategoryResult.rows,
      kpi: {
        totalUsers: parseInt(userCountResult.rows[0].count),
        totalShops: parseInt(shopCountResult.rows[0].count),
        totalRevenue: parseFloat(totalRevenueResult.rows[0].total),
        totalOrders: parseInt(orderCountResult.rows[0].count),
        aov: orderCountResult.rows[0].count > 0 ? (totalRevenueResult.rows[0].total / orderCountResult.rows[0].count) : 0
      }
    });
  } catch (error) {
    console.error('[Dashboard Summary Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { getDashboardSummary };
