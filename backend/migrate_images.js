const pool = require('./config/db');

async function migrate() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Product_Images (
                id SERIAL PRIMARY KEY,
                product_id INT REFERENCES Products(id) ON DELETE CASCADE,
                image_url TEXT NOT NULL,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            ALTER TABLE Product_Images ENABLE ROW LEVEL SECURITY;
            CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON Product_Images(product_id);
        `);
        console.log("Migration successful");
    } catch (e) {
        console.error("Migration failed", e);
    } finally {
        pool.end();
    }
}
migrate();
