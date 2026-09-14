-- Clear existing data
TRUNCATE TABLE OrderDetails, Orders, InventoryLogs, Products, Users, Categories RESTART IDENTITY CASCADE;

-- 1. Insert Categories
INSERT INTO Categories (id, name, description) VALUES
(1, 'Smartphones & Accessories', 'Latest smartphones and essential accessories'),
(2, 'Laptops & Computers', 'High-performance laptops and desktop peripherals'),
(3, 'Audio', 'Premium headphones, earbuds, and speakers'),
(4, 'Gaming', 'Consoles, video games, and gaming accessories'),
(5, 'Smart Home & Appliances', 'Modern appliances for a smart home');

-- 2. Insert Users (password is 'password123' hashed with bcrypt)
INSERT INTO Users (id, name, email, password_hash, role) VALUES
(1, 'Admin User', 'admin@example.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', 'admin'),
(2, 'John Doe', 'john@example.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', 'customer'),
(3, 'Jane Smith', 'jane@example.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', 'customer'),
(4, 'Alice Brown', 'alice@example.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', 'customer'),
(5, 'Bob Wilson', 'bob@example.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', 'customer');

-- 3. Insert Products
INSERT INTO Products (id, category_id, name, description, price, stock, image_url) VALUES
(1, 1, 'Apple iPhone 15 Pro Max (256GB)', 'Forged in titanium. Featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.', 1199.00, 150, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'),
(2, 1, 'Apple 20W USB-C Power Adapter', 'Fast, efficient charging at home, in the office, or on the go. Essential for iPhone 15 series.', 19.00, 500, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800'),
(3, 1, 'Spigen Liquid Air Armor Case for iPhone 15 Pro Max', 'Slim, form-fitted and lightweight design with anti-slip matte surface for premium protection.', 15.99, 300, 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&q=80&w=800'),
(4, 2, 'Apple MacBook Pro 14" M3 Pro', 'The most advanced Mac laptop for demanding workflows. 18GB RAM, 512GB SSD, Space Black.', 1999.00, 45, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'),
(5, 2, 'Apple Magic Mouse', 'Wireless, rechargeable mouse with an optimized foot design that lets it glide smoothly across your desk.', 79.00, 120, 'https://images.unsplash.com/photo-1527814050087-179f015b67e7?auto=format&fit=crop&q=80&w=800'),
(6, 3, 'Apple AirPods Pro (2nd Generation)', 'Rich, high-quality audio and up to 2x more Active Noise Cancellation. USB-C MagSafe Charging Case.', 249.00, 200, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800'),
(7, 3, 'Sony WH-1000XM5 Wireless Headphones', 'Industry-leading noise canceling with auto-optimizer, 30-hour battery life, and crystal clear hands-free calling.', 398.00, 80, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800'),
(8, 1, 'Samsung Galaxy S24 Ultra (256GB)', 'Titanium exterior, 200MP camera, and the new Snapdragon 8 Gen 3 for Galaxy. Includes S Pen.', 1299.00, 100, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800'),
(9, 1, 'Samsung 45W Super Fast Wall Charger', 'Quickly power up your Galaxy S24 Ultra to 100% with the official 45W charger.', 39.99, 250, 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=800'),
(10, 2, 'Apple iPad Air (5th Generation)', 'Supercharged by the Apple M1 chip. 10.9-inch Liquid Retina display and all-day battery life.', 599.00, 110, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800'),
(11, 1, 'Apple Pencil (2nd Generation)', 'Pixel-perfect precision and industry-leading low latency. Magnetically attaches and charges.', 129.00, 150, 'https://images.unsplash.com/photo-1542840410-3092f99611a3?auto=format&fit=crop&q=80&w=800'),
(12, 4, 'Nintendo Switch OLED Model', '7-inch OLED screen, 64GB internal storage, and enhanced audio in handheld and tabletop play.', 349.99, 70, 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=800'),
(13, 4, 'The Legend of Zelda: Tears of the Kingdom', 'Epic adventure across the land and skies of Hyrule. Exclusive for Nintendo Switch.', 69.99, 300, 'https://images.unsplash.com/photo-1607526972036-70eeb2e259b3?auto=format&fit=crop&q=80&w=800'),
(14, 5, 'Dyson V15 Detect Cordless Vacuum', 'Laser reveals microscopic dust. The most powerful, intelligent cordless vacuum.', 749.99, 30, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800'),
(15, 5, 'LG C3 65-inch 4K OLED Smart TV', 'OLED evo display, a9 AI Processor Gen6, 120Hz refresh rate, perfect for gaming and movies.', 1696.00, 15, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800');

SELECT setval('products_id_seq', 15);
SELECT setval('categories_id_seq', 5);
SELECT setval('users_id_seq', 5);

-- 4. Insert Orders & OrderDetails (Creating co-occurrence data for recommendations & best sellers)

-- Order 1: iPhone Ecosystem (iPhone + Charger + Case) -> Best Sellers
INSERT INTO Orders (id, user_id, total_amount, status) VALUES (1, 2, 1233.99, 'completed');
INSERT INTO OrderDetails (order_id, product_id, quantity, price_at_purchase) VALUES
(1, 1, 1, 1199.00), (1, 2, 1, 19.00), (1, 3, 1, 15.99);

-- Order 2: iPhone + AirPods + Charger
INSERT INTO Orders (id, user_id, total_amount, status) VALUES (2, 3, 1467.00, 'completed');
INSERT INTO OrderDetails (order_id, product_id, quantity, price_at_purchase) VALUES
(2, 1, 1, 1199.00), (2, 6, 1, 249.00), (2, 2, 1, 19.00);

-- Order 3: Mac setup (MacBook + Magic Mouse + AirPods Pro)
INSERT INTO Orders (id, user_id, total_amount, status) VALUES (3, 4, 2327.00, 'completed');
INSERT INTO OrderDetails (order_id, product_id, quantity, price_at_purchase) VALUES
(3, 4, 1, 1999.00), (3, 5, 1, 79.00), (3, 6, 1, 249.00);

-- Order 4: Galaxy Ecosystem
INSERT INTO Orders (id, user_id, total_amount, status) VALUES (4, 5, 1338.99, 'completed');
INSERT INTO OrderDetails (order_id, product_id, quantity, price_at_purchase) VALUES
(4, 8, 1, 1299.00), (4, 9, 1, 39.99);

-- Order 5: iPad Setup
INSERT INTO Orders (id, user_id, total_amount, status) VALUES (5, 2, 728.00, 'completed');
INSERT INTO OrderDetails (order_id, product_id, quantity, price_at_purchase) VALUES
(5, 10, 1, 599.00), (5, 11, 1, 129.00);

-- Order 6: Gaming Setup
INSERT INTO Orders (id, user_id, total_amount, status) VALUES (6, 3, 817.98, 'completed');
INSERT INTO OrderDetails (order_id, product_id, quantity, price_at_purchase) VALUES
(6, 12, 1, 349.99), (6, 13, 1, 69.99), (6, 7, 1, 398.00);

-- Order 7: iPhone + Case again (Boost iPhone and Case as best sellers)
INSERT INTO Orders (id, user_id, total_amount, status) VALUES (7, 4, 1214.99, 'completed');
INSERT INTO OrderDetails (order_id, product_id, quantity, price_at_purchase) VALUES
(7, 1, 1, 1199.00), (7, 3, 1, 15.99);

-- Order 8: iPhone + Charger again
INSERT INTO Orders (id, user_id, total_amount, status) VALUES (8, 5, 1218.00, 'completed');
INSERT INTO OrderDetails (order_id, product_id, quantity, price_at_purchase) VALUES
(8, 1, 1, 1199.00), (8, 2, 1, 19.00);

-- Order 9: Dyson + TV (Big spenders)
INSERT INTO Orders (id, user_id, total_amount, status) VALUES (9, 2, 2445.99, 'completed');
INSERT INTO OrderDetails (order_id, product_id, quantity, price_at_purchase) VALUES
(9, 14, 1, 749.99), (9, 15, 1, 1696.00);

-- Note: The trigger `after_order_detail_insert` will auto-deduct stock and create InventoryLogs!
SELECT setval('orders_id_seq', 9);
