const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const fashionNames = [
  "Classic Cotton T-Shirt", "Slim Fit Denim Jeans", "Casual Pullover Hoodie", 
  "Leather Moto Jacket", "Formal Button-Down Shirt", "Athletic Running Shorts",
  "Vintage Wash Jeans", "V-Neck Sweater", "Linen Blend Trousers", "Puffer Jacket"
];

const fashionImages = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
  "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
  "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&q=80",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80"
];

const techNames = [
  "Pro Gaming Laptop 15\"", "Wireless Noise-Cancelling Headphones", "Mechanical RGB Keyboard", 
  "4K Ultra HD Monitor", "Smart Home Security Camera", "Bluetooth Portable Speaker",
  "Ergonomic Wireless Mouse", "10000mAh Power Bank", "Smartphone Gimbal Stabilizer", "True Wireless Earbuds"
];

const techImages = [
  "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80",
  "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
  "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=800&q=80"
];

const generalNames = [
  "Modern Ceramic Vase", "Stainless Steel Water Bottle", "Organic Cotton Bath Towel", 
  "Aromatherapy Essential Oil Diffuser", "Bamboo Cutting Board", "Yoga Mat with Alignment Lines",
  "Insulated Travel Mug", "Minimalist Wall Clock", "Set of 4 Coasters", "Desk Organizer"
];

const generalImages = [
  "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=800&q=80",
  "https://images.unsplash.com/photo-1606115915090-be18fea23ce7?w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7def515?w=800&q=80"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fixProductNames() {
  try {
    const categoriesResult = await pool.query("SELECT id, name FROM Categories");
    const categories = categoriesResult.rows;

    const fashionKeywords = ['fashion', 'shoe', 'bag', 'apparel', 'beauty', 'watch'];
    const techKeywords = ['smart', 'phone', 'laptop', 'computer', 'electronic', 'audio', 'gaming', 'camera', 'appliance'];

    // We'll update products category by category
    for (const category of categories) {
      const catLower = category.name.toLowerCase();
      let names = generalNames;
      let images = generalImages;

      if (fashionKeywords.some(kw => catLower.includes(kw))) {
        names = fashionNames;
        images = fashionImages;
      } else if (techKeywords.some(kw => catLower.includes(kw))) {
        names = techNames;
        images = techImages;
      }

      console.log(`Processing category: ${category.name} (ID: ${category.id})`);
      
      // Since doing an update row-by-row for 100k rows is slow, we will use a clever SQL update
      // We'll update the image to be random from the array based on the product ID modulo
      
      const namesSql = names.map((name, i) => `WHEN id % ${names.length} = ${i} THEN '${name.replace(/'/g, "''")}'`).join(' ');
      const imagesSql = images.map((img, i) => `WHEN id % ${images.length} = ${i} THEN '${img}'`).join(' ');

      const query = `
        UPDATE Products 
        SET 
          name = CASE ${namesSql} END,
          image_url = CASE ${imagesSql} END
        WHERE category_id = $1 AND id > 5;
      `;
      
      await pool.query(query, [category.id]);
      console.log(`Updated products for ${category.name}`);
    }

    console.log("Finished updating product names!");
  } catch (error) {
    console.error("Error updating products:", error);
  } finally {
    pool.end();
  }
}

fixProductNames();
