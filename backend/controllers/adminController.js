const pool = require('../config/db');

const getDashboardSummary = async (req, res) => {
  try {
    // 1. Get Sales Summary from View
    const salesResult = await pool.query('SELECT * FROM vw_admin_sales_summary LIMIT 30');
    
    // 2. Get Low Stock Products
    const lowStockResult = await pool.query('SELECT id, name, stock FROM Products WHERE stock < 10 ORDER BY stock ASC');
    
    // 3. Get Recent Inventory Logs
    const inventoryLogsResult = await pool.query(`
      SELECT il.id, p.name, il.change_amount, il.reason, il.created_at 
      FROM InventoryLogs il 
      JOIN Products p ON il.product_id = p.id 
      ORDER BY il.created_at DESC LIMIT 10
    `);

    res.json({
      salesSummary: salesResult.rows,
      lowStockProducts: lowStockResult.rows,
      recentInventoryLogs: inventoryLogsResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { getDashboardSummary };
