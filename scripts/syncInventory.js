require('dotenv').config({ path: '../backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function syncInventory() {
  console.log('Starting Inventory Batch Sync...');
  
  // Simulated data from a CSV or external ERP system
  const incomingStock = [
    { productId: 1, stock: 50 },
    { productId: 2, stock: 120 },
    { productId: 3, stock: 5 },
    { productId: 4, stock: 0 },
    { productId: 5, stock: 300 }
  ];

  try {
    for (const item of incomingStock) {
      // Get current stock
      const productRes = await pool.query('SELECT stock, name FROM Products WHERE id = $1', [item.productId]);
      if (productRes.rows.length > 0) {
        const product = productRes.rows[0];
        const diff = item.stock - product.stock;
        
        if (diff !== 0) {
          // Update product
          await pool.query('UPDATE Products SET stock = $1 WHERE id = $2', [item.stock, item.productId]);
          
          // Insert log
          await pool.query(`
            INSERT INTO InventoryLogs (product_id, change_amount, reason) 
            VALUES ($1, $2, 'Batch Sync')
          `, [item.productId, diff]);
          
          console.log(`[UPDATED] ${product.name}: ${product.stock} -> ${item.stock} (Diff: ${diff > 0 ? '+' : ''}${diff})`);
        } else {
          console.log(`[SKIPPED] ${product.name}: Stock unchanged (${item.stock})`);
        }
      }
    }
    console.log('✅ Inventory Batch Sync Completed Successfully.');
  } catch (err) {
    console.error('❌ Error syncing inventory:', err);
  } finally {
    await pool.end();
  }
}

syncInventory();
