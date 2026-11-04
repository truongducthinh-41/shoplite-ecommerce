-- ==============================================================================
-- SHOPLITE AI - SEED DATA FOR DEMO & CAPSTONE PROJECT PRESENTATION
-- Includes 3 User Roles (Admin, Sellers with Shops, Customers),
-- World-Class Global Brands per Category, Realistic Flagship Products & Orders
-- ==============================================================================

-- Clear existing data
TRUNCATE TABLE 
    ProductAuditLogs,
    InventoryLogs, 
    Reviews, 
    OrderDetails, 
    Orders, 
    Products, 
    Category_Brands, 
    Brands, 
    Categories, 
    Shops, 
    Users 
RESTART IDENTITY CASCADE;

-- ------------------------------------------------------------------------------
-- 1. SEED USERS (Password for all accounts is 'password123' bcrypt hashed)
-- Hash: $2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u
-- ------------------------------------------------------------------------------
INSERT INTO Users (id, name, email, password_hash, phone, role) VALUES
(1, 'System Administrator', 'admin@shoplite.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0901000001', 'admin'),
(2, 'Apple Vietnam Official', 'apple_official@shoplite.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0902000002', 'seller'),
(3, 'Nike Retail Flagship', 'nike_official@shoplite.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0903000003', 'seller'),
(4, 'Samsung Global Store', 'samsung_official@shoplite.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0904000004', 'seller'),
(5, 'Nguyen Van A (Buyer)', 'customer1@gmail.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0905000005', 'customer'),
(6, 'Tran Thi B (Buyer)', 'customer2@gmail.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0906000006', 'customer');

SELECT setval('users_id_seq', 6);

-- ------------------------------------------------------------------------------
-- 2. SEED SHOPS (Gian hàng của từng Seller - Chuẩn Shopee Mall)
-- ------------------------------------------------------------------------------
INSERT INTO Shops (id, owner_id, name, slug, description, logo_url, rating, is_official) VALUES
(1, 2, 'Apple Flagship Store', 'apple-flagship-store', 'Cửa hàng chính hãng phân phối ủy quyền thiết bị Apple chính thức trên ShopLite.', 'https://cdn.simpleicons.org/apple/white', 4.95, TRUE),
(2, 3, 'Nike Official Store', 'nike-official-store', 'Thương hiệu đồ thể thao, giày chạy bộ và thời trang chính hãng Nike toàn cầu.', 'https://cdn.simpleicons.org/nike/white', 4.88, TRUE),
(3, 4, 'Samsung Brand Store', 'samsung-brand-store', 'Gian hàng trực tiếp từ tập đoàn công nghệ Samsung Electronics Vietnam.', 'https://cdn.simpleicons.org/samsung/white', 4.90, TRUE);

SELECT setval('shops_id_seq', 3);

-- ------------------------------------------------------------------------------
-- 3. SEED CATEGORIES (Danh mục phân cấp Cha - Con theo chuẩn E-commerce)
-- ------------------------------------------------------------------------------
INSERT INTO Categories (id, parent_id, name, slug, icon_name, description) VALUES
-- Parent Categories
(1, NULL, 'Electronics & Gadgets', 'electronics-gadgets', 'Smartphone', 'Thiết bị điện tử, công nghệ và phụ kiện thông minh'),
(2, NULL, 'Fashion & Apparel', 'fashion-apparel', 'Shirt', 'Thời trang nam nữ, giày dép và phụ kiện thời thượng'),
(3, NULL, 'Gaming & Esports', 'gaming-esports', 'Gamepad2', 'Máy chơi game, linh kiện PC và gaming gear'),
(4, NULL, 'Home & Smart Living', 'home-smart-living', 'Home', 'Đồ gia dụng thông minh, thiết bị tiện ích gia đình'),

-- Subcategories (Con của Electronics & Gadgets)
(5, 1, 'Smartphones & Tablets', 'smartphones-tablets', 'Smartphone', 'Điện thoại di động và máy tính bảng cao cấp'),
(6, 1, 'Laptops & Computers', 'laptops-computers', 'Laptop', 'Laptop văn phòng, đồ họa và máy tính xách tay'),
(7, 1, 'Audio & Headphones', 'audio-headphones', 'Headphones', 'Tai nghe chống ồn, loa bluetooth và thiết bị âm thanh'),

-- Subcategories (Con của Fashion & Apparel)
(8, 2, 'Sneakers & Shoes', 'sneakers-shoes', 'Footprints', 'Giày thể thao, giày chạy bộ và sneaker phong cách'),
(9, 2, 'Sportswear & Outfits', 'sportswear-outfits', 'Shirt', 'Quần áo thể thao, áo hoodie và trang phục vận động'),

-- Subcategories (Con của Gaming)
(10, 3, 'Consoles & Handhelds', 'consoles-handhelds', 'Gamepad', 'Máy chơi game console gia đình và máy chơi game cầm tay'),

-- Subcategories (Con của Home Living)
(11, 4, 'Smart Home Appliances', 'smart-home-appliances', 'Sparkles', 'Máy hút bụi, TV màn hình lớn và đồ gia dụng cao cấp');

SELECT setval('categories_id_seq', 11);

-- ------------------------------------------------------------------------------
-- 4. SEED BRANDS (Các thương hiệu nổi tiếng nhất thế giới chuẩn 3NF/BCNF)
-- ------------------------------------------------------------------------------
INSERT INTO Brands (id, name, slug, logo_url, origin_country, description) VALUES
(1, 'Apple', 'apple', 'https://cdn.simpleicons.org/apple/white', 'Hoa Kỳ', 'Tập đoàn công nghệ tiên phong toàn cầu về điện thoại, máy tính và thiết bị đeo'),
(2, 'Samsung', 'samsung', 'https://cdn.simpleicons.org/samsung/white', 'Hàn Quốc', 'Tập đoàn đa quốc gia đứng đầu về màn hình, bán dẫn và smartphone Android'),
(3, 'Sony', 'sony', 'https://cdn.simpleicons.org/sony/white', 'Nhật Bản', 'Thương hiệu hàng đầu về thiết bị âm thanh cao cấp, máy ảnh và máy chơi game PlayStation'),
(4, 'Nike', 'nike', 'https://cdn.simpleicons.org/nike/white', 'Hoa Kỳ', 'Thương hiệu thời trang, giày thể thao và dụng cụ thể thao số một hành tinh'),
(5, 'Adidas', 'adidas', 'https://cdn.simpleicons.org/adidas/white', 'Đức', 'Biểu tượng 3 sọc của làng thời trang thể thao phong cách cổ điển và hiện đại'),
(6, 'Nintendo', 'nintendo', 'https://cdn.simpleicons.org/nintendo/white', 'Nhật Bản', 'Hãng game huyền thoại nổi tiếng với máy Switch, Mario và Zelda'),
(7, 'Dyson', 'dyson', 'https://cdn.simpleicons.org/dyson/white', 'Vương Quốc Anh', 'Thương hiệu gia dụng công nghệ cao với máy hút bụi và thiết bị chăm sóc tóc số 1'),
(8, 'LG', 'lg', 'https://cdn.simpleicons.org/lg/white', 'Hàn Quốc', 'Tập đoàn điện tử gia dụng hàng đầu thế giới với tấm nền OLED tân tiến');

SELECT setval('brands_id_seq', 8);

-- ------------------------------------------------------------------------------
-- 5. SEED CATEGORY_BRANDS (Gắn kết các thương hiệu danh tiếng vào từng Danh mục)
-- ------------------------------------------------------------------------------
INSERT INTO Category_Brands (category_id, brand_id) VALUES
-- Smartphones
(5, 1), (5, 2),
-- Laptops
(6, 1), (6, 2),
-- Audio
(7, 1), (7, 2), (7, 3),
-- Sneakers
(8, 4), (8, 5),
-- Sportswear
(9, 4), (9, 5),
-- Gaming Consoles
(10, 3), (10, 6),
-- Home Appliances
(11, 7), (11, 8);

-- ------------------------------------------------------------------------------
-- 6. SEED PRODUCTS (Sản phẩm mẫu đại diện cho từng Shop & Danh mục)
-- ------------------------------------------------------------------------------
INSERT INTO Products (id, shop_id, category_id, brand_id, sku, name, description, price, original_price, stock, sold_count, image_url) VALUES
-- Shop 1: Apple Flagship Store
(1, 1, 5, 1, 'APL-IP15PM-256', 'Apple iPhone 15 Pro Max 256GB - Khung Titanium Tự Nhiên', 'Thiết kế titanium siêu bền nhẹ, chip A17 Pro mang lại hiệu năng gaming đỉnh cao và camera tiềm vọng quang học 5x sắc nét.', 1199.00, 1399.00, 85, 342, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'),
(2, 1, 6, 1, 'APL-MBP14-M3', 'Apple MacBook Pro 14" M3 Pro (18GB RAM, 512GB SSD) Space Black', 'Hiệu năng đồ họa chuyên nghiệp cho lập trình viên và creator. Thời lượng pin lên đến 18 tiếng liên tục.', 1999.00, 2299.00, 40, 128, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'),
(3, 1, 7, 1, 'APL-APP2-USBC', 'Apple AirPods Pro 2 (USB-C MagSafe Charging Case)', 'Khử tiếng ồn chủ động (ANC) tốt hơn gấp 2 lần, âm thanh thích ứng theo môi trường và khả năng chống nước chuẩn IP54.', 249.00, 299.00, 150, 520, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800'),
(4, 1, 6, 1, 'APL-MGM-WHT', 'Apple Magic Mouse - Cảm ứng đa điểm bề mặt kính', 'Chuột Bluetooth không dây chính hãng với thiết kế tối giản, trượt êm ái trên mọi bề mặt làm việc.', 79.00, 99.00, 95, 210, 'https://images.unsplash.com/photo-1527814050087-179f015b67e7?auto=format&fit=crop&q=80&w=800'),

-- Shop 2: Nike Official Store
(5, 2, 8, 4, 'NKE-AF1-07W', 'Giày Sneaker Nike Air Force 1 07 All-White Classic', 'Mẫu sneaker bất hủ mọi thời đại, chất liệu da bóng mượt, đệm Air êm ái hỗ trợ tối đa cho các hoạt động thường ngày.', 115.00, 135.00, 120, 680, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800'),
(6, 2, 8, 4, 'NKE-PEG40-BLK', 'Giày Chạy Bộ Nike Air Zoom Pegasus 40 React Foam', 'Độ đàn hồi vượt trội kết hợp đệm Zoom kép giúp bạn bứt phá từng cung đường chạy marathon dài ngày.', 130.00, 150.00, 65, 310, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'),
(7, 2, 9, 4, 'NKE-NSW-CLUB', 'Áo Hoodie Thể Thao Nike Sportswear Club Fleece Unisex', 'Chất nỉ bông mềm mại ấm áp, form rộng rãi trẻ trung, thêu logo Nike Futura kinh điển trước ngực.', 65.00, 80.00, 80, 450, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800'),

-- Shop 3: Samsung Brand Store
(8, 3, 5, 2, 'SAM-S24U-512', 'Samsung Galaxy S24 Ultra 512GB (Titanium Gray, Galaxy AI)', 'Quyền năng Galaxy AI dịch thuật trực tiếp, camera 200MP zoom mắt thần bóng đêm và bút S-Pen tích hợp trong thân máy.', 1299.00, 1499.00, 70, 275, 'https://images.unsplash.com/photo-1678911820864-e6c5bb5d2cf5?auto=format&fit=crop&q=80&w=800&h=800'),
(9, 3, 7, 2, 'SAM-BUDSP2', 'Tai Nghe Samsung Galaxy Buds2 Pro - Chống Ồn Thông Minh', 'Âm thanh vòm chuẩn rạp chiếu 24-bit Hi-Fi cùng thiết kế công thái học nhỏ gọn vừa vặn với vành tai.', 179.00, 229.00, 90, 195, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800'),
(10, 3, 11, 8, 'LG-C3-65OLED', 'Smart TV LG OLED evo C3 65 inch 4K 120Hz Dolby Vision', 'Tấm nền OLED tự phát sáng rực rỡ, bộ xử lý a9 AI Gen6 cho trải nghiệm điện ảnh và chơi game console mượt mà.', 1699.00, 2199.00, 15, 62, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800'),

-- Gaming & Home Smart Living
(11, 1, 10, 6, 'NTD-SW-OLED', 'Máy Chơi Game Nintendo Switch OLED Model White Joy-Con', 'Màn hình OLED 7-inch sống động, chân đế đa năng và trải nghiệm linh hoạt giữa chế độ Handheld và TV.', 349.00, 399.00, 50, 420, 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=800'),
(12, 1, 10, 3, 'SNY-PS5-SLIM', 'Máy Chơi Game Sony PlayStation 5 Slim Disc Edition 1TB', 'Tận hưởng sức mạnh load game thần tốc với ổ cứng SSD siêu tốc và phản hồi xúc giác chân thực của DualSense.', 499.00, 550.00, 35, 380, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800'),
(13, 1, 7, 3, 'SNY-WH1000XM5', 'Tai Nghe Không Dây Sony WH-1000XM5 Noise Cancelling', 'Đỉnh cao chống ồn chủ động công nghệ kép, thời lượng pin 30 giờ và chất âm chuẩn phòng thu Hi-Res Audio.', 398.00, 449.00, 45, 185, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800'),
(14, 3, 11, 7, 'DYS-V15-DET', 'Máy Hút Bụi Không Dây Dyson V15 Detect Absolute Tia Laser', 'Công nghệ chiếu laser phát hiện bụi vi mô vô hình, lực hút xoáy cực đại và đầu hút chống rối tóc độc quyền.', 749.00, 899.00, 25, 95, 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800&h=800');

SELECT setval('products_id_seq', 14);

-- ------------------------------------------------------------------------------
-- 7. SEED ORDERS & ORDERDETAILS (Minh chứng dữ liệu mua bán đa gian hàng)
-- ------------------------------------------------------------------------------
-- Đơn hàng 1: Khách 1 mua hệ sinh thái Apple (iPhone + AirPods Pro)
INSERT INTO Orders (id, user_id, total_amount, shipping_address, payment_method, status) VALUES
(1, 5, 1448.00, 'Tòa nhà Landmark 81, P.22, Q. Bình Thạnh, TP.HCM', 'credit_card', 'completed');

INSERT INTO OrderDetails (id, order_id, product_id, shop_id, quantity, price_at_purchase) VALUES
(1, 1, 1, 1, 1, 1199.00),
(2, 1, 3, 1, 1, 249.00);

-- Đơn hàng 2: Khách 1 mua đồ thể thao Nike (Giày Air Force 1 + Áo Hoodie)
INSERT INTO Orders (id, user_id, total_amount, shipping_address, payment_method, status) VALUES
(2, 5, 180.00, 'Tòa nhà Landmark 81, P.22, Q. Bình Thạnh, TP.HCM', 'cod', 'completed');

INSERT INTO OrderDetails (id, order_id, product_id, shop_id, quantity, price_at_purchase) VALUES
(3, 2, 5, 2, 1, 115.00),
(4, 2, 7, 2, 1, 65.00);

-- Đơn hàng 3: Khách 2 mua sản phẩm Gaming & Giải trí đa shop
INSERT INTO Orders (id, user_id, total_amount, shipping_address, payment_method, status) VALUES
(3, 6, 848.00, 'Số 280 An Dương Vương, P.4, Q.5, TP.HCM', 'banking', 'completed');

INSERT INTO OrderDetails (id, order_id, product_id, shop_id, quantity, price_at_purchase) VALUES
(5, 3, 11, 1, 1, 349.00),
(6, 3, 12, 1, 1, 499.00);

SELECT setval('orders_id_seq', 3);
SELECT setval('orderdetails_id_seq', 6);

-- ------------------------------------------------------------------------------
-- 8. SEED REVIEWS (Đánh giá người dùng chân thực)
-- ------------------------------------------------------------------------------
INSERT INTO Reviews (id, product_id, user_id, order_id, rating, comment) VALUES
(1, 1, 5, 1, 5, 'Màu Titan tự nhiên cầm rất nhẹ và mát tay, camera zoom 5x chụp concert cực kỳ rõ nét!'),
(2, 3, 5, 1, 5, 'Chống ồn của AirPods Pro 2 đi ngoài đường xe cộ ồn ào bật lên là êm ru, rất đáng tiền.'),
(3, 5, 5, 2, 5, 'Giày Air Force 1 chính hãng Nike đi chuẩn form, da êm, dễ phối mọi loại outfit đi học đi làm.'),
(4, 11, 6, 3, 5, 'Màn hình OLED của Nintendo Switch chơi Zelda ngoài trời sáng đẹp rực rỡ, giao hàng nhanh 2h.');

SELECT setval('reviews_id_seq', 4);

-- Đồng bộ lại rating_avg cho các sản phẩm đã có review
UPDATE Products SET rating_avg = 5.00, review_count = 1 WHERE id IN (1, 3, 5, 11);
