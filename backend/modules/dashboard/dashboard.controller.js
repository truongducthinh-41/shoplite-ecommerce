const pool = require('../../config/db');

const getDashboardSummary = async (req, res) => {
  try {
    // 1. Get Sales Summary (mock or simple aggregation)
    const salesResult = await pool.query(`
      SELECT DATE(created_at) as sale_date, COUNT(id) as total_orders, SUM(total_amount) as daily_revenue
      FROM Orders 
      GROUP BY DATE(created_at)
      ORDER BY sale_date DESC
      LIMIT 30
    `);
    
    // 2. Get Low Stock Products
    const lowStockResult = await pool.query('SELECT id, name, stock FROM Products WHERE stock < 10 ORDER BY stock ASC');
    
    // 3. Get KPI Metrics
    const userCountResult = await pool.query('SELECT COUNT(*) FROM Users');
    const totalRevenueResult = await pool.query('SELECT SUM(total_amount) FROM Orders');
    const orderCountResult = await pool.query('SELECT COUNT(*) FROM Orders');

    res.json({
      salesSummary: salesResult.rows,
      lowStockProducts: lowStockResult.rows,
      kpi: {
        totalUsers: userCountResult.rows[0].count,
        totalRevenue: totalRevenueResult.rows[0].sum || 0,
        totalOrders: orderCountResult.rows[0].count,
        aov: orderCountResult.rows[0].count > 0 ? (totalRevenueResult.rows[0].sum / orderCountResult.rows[0].count) : 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { getDashboardSummary };
