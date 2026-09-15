require('dotenv').config();
const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const TARGET_PRODUCTS = 100000;
const BATCH_SIZE = 1000;

// Helper to generate a realistic product description
function generateDescription() {
    return `${faker.commerce.productDescription()}\n\nKey Features:\n- ${faker.commerce.productAdjective()} design\n- High quality materials\n- Reliable and durable\n\nPerfect for ${faker.commerce.productAdjective()} uses.`;
}

// Fixed Images pool from unsplash
const placeholderImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281501f?w=800&q=80',
    'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=800&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80'
];

async function fixSpecificProducts() {
    console.log("Fixing Zelda and Magic Mouse...");
    const magicMouseImg = 'https://images.unsplash.com/photo-1618424879685-612666d9c6c0?auto=format&fit=crop&q=80&w=800';
    const zeldaImg = 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&q=80&w=800';
    
    // Fix Products table main image
    await pool.query("UPDATE Products SET image_url = $1 WHERE name ILIKE '%Magic Mouse%'", [magicMouseImg]);
    await pool.query("UPDATE Products SET image_url = $1 WHERE name ILIKE '%Zelda%'", [zeldaImg]);
    
    // Add multiple images for them in Product_Images
    const products = await pool.query("SELECT id, name FROM Products WHERE name ILIKE '%Magic Mouse%' OR name ILIKE '%Zelda%'");
    for (const p of products.rows) {
        // Clear existing product images just in case
        await pool.query("DELETE FROM Product_Images WHERE product_id = $1", [p.id]);
        
        let mainImg = p.name.toLowerCase().includes('zelda') ? zeldaImg : magicMouseImg;
        // Insert main image
        await pool.query("INSERT INTO Product_Images(product_id, image_url, display_order) VALUES ($1, $2, 0)", [p.id, mainImg]);
        // Insert 3 more random placeholders to make it 4 images total
        for (let i = 1; i < 4; i++) {
            let rndImg = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
            await pool.query("INSERT INTO Product_Images(product_id, image_url, display_order) VALUES ($1, $2, $3)", [p.id, rndImg, i]);
        }
    }
}

async function seed() {
    try {
        await fixSpecificProducts();

        console.log(`Starting to seed ${TARGET_PRODUCTS} products in batches of ${BATCH_SIZE}...`);
        // We need a category to associate products with. Let's get the first one, or create one if none.
        let catRes = await pool.query("SELECT id FROM Categories LIMIT 1");
        if (catRes.rowCount === 0) {
            catRes = await pool.query("INSERT INTO Categories (name, description) VALUES ('Electronics', 'All electronics') RETURNING id");
        }
        const categoryId = catRes.rows[0].id;

        for (let i = 0; i < TARGET_PRODUCTS; i += BATCH_SIZE) {
            const currentBatchSize = Math.min(BATCH_SIZE, TARGET_PRODUCTS - i);
            let productValues = [];
            let productParams = [];
            
            // Build the multi-insert query for Products
            for (let j = 0; j < currentBatchSize; j++) {
                const name = faker.commerce.productName() + ' ' + faker.string.alphanumeric(4);
                const description = generateDescription();
                const price = faker.commerce.price({ min: 10, max: 1000, dec: 2 });
                const stock = faker.number.int({ min: 10, max: 1000 });
                // We pick one random image for the main Products.image_url
                const mainImg = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
                
                const offset = j * 6;
                productParams.push(categoryId, name, description, price, stock, mainImg);
                productValues.push(`($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4}, $${offset+5}, $${offset+6})`);
            }
            
            const insertQuery = `
                INSERT INTO Products (category_id, name, description, price, stock, image_url) 
                VALUES ${productValues.join(',')} 
                RETURNING id, image_url
            `;
            
            const result = await pool.query(insertQuery, productParams);
            
            // Now insert images into Product_Images
            let imageValues = [];
            let imageParams = [];
            let imgIndex = 1;
            
            for (let p = 0; p < result.rows.length; p++) {
                const pid = result.rows[p].id;
                const mainImg = result.rows[p].image_url;
                
                // Add main image at order 0
                imageParams.push(pid, mainImg, 0);
                imageValues.push(`($${imgIndex}, $${imgIndex+1}, $${imgIndex+2})`);
                imgIndex += 3;
                
                // Add 3 more random images (total 4 per product)
                for (let o = 1; o <= 3; o++) {
                    const rndImg = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
                    imageParams.push(pid, rndImg, o);
                    imageValues.push(`($${imgIndex}, $${imgIndex+1}, $${imgIndex+2})`);
                    imgIndex += 3;
                }
            }
            
            const imageQuery = `
                INSERT INTO Product_Images (product_id, image_url, display_order)
                VALUES ${imageValues.join(',')}
            `;
            await pool.query(imageQuery, imageParams);
            
            if ((i + currentBatchSize) % 10000 === 0) {
                console.log(`Seeded ${i + currentBatchSize} products...`);
            }
        }
        
        console.log("Seeding complete!");
        
    } catch (err) {
        console.error("Seeding error:", err);
    } finally {
        pool.end();
    }
}

seed();
