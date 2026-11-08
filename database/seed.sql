-- Xóa dữ liệu cũ theo thứ tự ràng buộc khóa ngoại
TRUNCATE TABLE 
    UserInteractions,
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
-- 1. SEED USERS (Password cho tất cả tài khoản: 'password123' bcrypt hashed)
-- Hash: $2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u
-- ------------------------------------------------------------------------------
INSERT INTO Users (id, name, email, password_hash, phone, role) VALUES
(1, 'System Administrator', 'admin@shoplite.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0901000001', 'admin'),
(2, 'Apple Vietnam Official', 'apple_official@shoplite.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0902000002', 'seller'),
(3, 'Nike Retail Flagship', 'nike_official@shoplite.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0903000003', 'seller'),
(4, 'Samsung Global Store', 'samsung_official@shoplite.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0904000004', 'seller'),
(5, 'Sony Official Vietnam', 'sony_official@shoplite.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0905000005', 'seller'),
(6, 'L''Oreal Paris Mall', 'loreal_official@shoplite.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0906000006', 'seller'),
(7, 'Unilever Vietnam Store', 'unilever_official@shoplite.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0907000007', 'seller'),
(8, 'Casio Watch Flagship', 'casio_official@shoplite.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0908000008', 'seller'),
(9, 'Decathlon Sports World', 'decathlon_official@shoplite.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0909000009', 'seller'),
(10, 'Nguyen Van A (Buyer)', 'customer1@gmail.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0910000010', 'customer'),
(11, 'Bành Thị Tòn Tén (Buyer)', 'customer2@gmail.com', '$2b$10$36WYZjQl6/Clnwxk2MHYkOooVpV8gwma./uX8AWmZ4sIa3YntVJ1u', '0987270635', 'customer');

SELECT setval('users_id_seq', 11);

-- ------------------------------------------------------------------------------
-- 2. SEED SHOPS (8 Gian hàng chính hãng Shopee Mall đa ngành hàng)
-- ------------------------------------------------------------------------------
INSERT INTO Shops (id, owner_id, name, slug, description, logo_url, rating, is_official) VALUES
(1, 2, 'Apple Flagship Store', 'apple-flagship-store', 'Cửa hàng chính hãng phân phối ủy quyền thiết bị Apple chính thức trên ShopLite.', 'https://cdn.simpleicons.org/apple/white', 4.96, TRUE),
(2, 3, 'Nike Official Store', 'nike-official-store', 'Thương hiệu đồ thể thao, giày chạy bộ và thời trang chính hãng Nike toàn cầu.', 'https://cdn.simpleicons.org/nike/white', 4.90, TRUE),
(3, 4, 'Samsung Brand Store', 'samsung-brand-store', 'Gian hàng trực tiếp từ tập đoàn công nghệ Samsung Electronics Vietnam.', 'https://cdn.simpleicons.org/samsung/white', 4.92, TRUE),
(4, 5, 'Sony Official Store', 'sony-official-store', 'Gian hàng điện tử, máy ảnh và thiết bị âm thanh đỉnh cao Sony Vietnam.', 'https://cdn.simpleicons.org/sony/white', 4.89, TRUE),
(5, 6, 'L''Oreal Paris Official Mall', 'loreal-paris-official', 'Chuyên trang mỹ phẩm, chăm sóc da và làm đẹp số 1 nước Pháp.', 'https://cdn.simpleicons.org/loreal/white', 4.94, TRUE),
(6, 7, 'Unilever Vietnam Store', 'unilever-vietnam-store', 'Tập đoàn hàng tiêu dùng nhanh, thực phẩm dinh dưỡng và chăm sóc gia đình.', 'https://cdn.simpleicons.org/unilever/white', 4.87, TRUE),
(7, 8, 'Casio Watch Flagship', 'casio-watch-flagship', 'Nhà phân phối ủy quyền đồng hồ Casio G-Shock, Edifice và Baby-G tại Việt Nam.', 'https://cdn.simpleicons.org/casio/white', 4.91, TRUE),
(8, 9, 'Decathlon Sports World', 'decathlon-sports-world', 'Siêu thị dụng cụ thể thao, đồ tập gym yoga và dã ngoại châu Âu.', 'https://cdn.simpleicons.org/decathlon/white', 4.88, TRUE);

SELECT setval('shops_id_seq', 8);

-- ------------------------------------------------------------------------------
-- 3. SEED CATEGORIES (5 Danh mục gốc Cha + 24 Danh mục con Chuẩn Giao diện Shopee)
-- ------------------------------------------------------------------------------
INSERT INTO Categories (id, parent_id, name, slug, icon_name, description) VALUES
-- 5 Parent Categories (Gốc - Dành cho Phân cấp, Breadcrumb & Recursive CTE)
(1, NULL, 'Electronics & Technology', 'electronics-technology', 'Monitor', 'Thiết bị điện tử, công nghệ, âm thanh và viễn thông'),
(2, NULL, 'Fashion & Apparel', 'fashion-apparel', 'Shirt', 'Thời trang, giày dép, túi ví và phụ kiện cao cấp'),
(3, NULL, 'Home & Living Ecosystem', 'home-living-ecosystem', 'Home', 'Đồ gia dụng, nội thất thông minh và thú cưng'),
(4, NULL, 'Beauty & Personal Care', 'beauty-personal-care', 'Sparkles', 'Chăm sóc sắc đẹp, mỹ phẩm, sức khỏe và mẹ bé'),
(5, NULL, 'Sports, Auto & Lifestyle', 'sports-auto-lifestyle', 'Dumbbell', 'Thể thao ngoài trời, phụ kiện ô tô xe máy, sách quà tặng và voucher'),

-- 24 Subcategories (Khớp chính xác 100% với Icon & Nút Danh mục trên Homepage)
-- Nhóm 1: Công nghệ & Điện tử
(10, 1, 'Smartphones & Accessories', 'smartphones-accessories', 'Smartphone', 'Điện thoại thông minh, ốp lưng, củ sạc và phụ kiện di động'),
(11, 1, 'Electronics', 'electronics', 'Monitor', 'Tivi màn hình lớn, màn hình đồ họa máy tính, máy chiếu phim'),
(12, 1, 'Laptops & Computers', 'laptops-computers', 'Laptop', 'Laptop văn phòng, máy tính gaming, linh kiện PC và chuột bàn phím'),
(13, 1, 'Cameras', 'cameras', 'Camera', 'Máy ảnh cơ chuyên nghiệp, ống kính máy ảnh, gimbal và flycam'),
(14, 1, 'Audio', 'audio', 'Headphones', 'Tai nghe bluetooth không dây, loa di động, soundbar phòng khách'),
(15, 1, 'Gaming', 'gaming', 'Gamepad2', 'Máy chơi game console, tay cầm điều khiển, đĩa game bản quyền'),

-- Nhóm 2: Thời trang & Phụ kiện
(16, 2, 'Men''s Fashion', 'mens-fashion', 'Shirt', 'Thời trang nam, áo thun, sơ mi công sở, áo khoác gió thời thượng'),
(17, 2, 'Women''s Fashion', 'womens-fashion', 'ShoppingBag', 'Thời trang nữ, đầm dự tiệc, áo kiểu, chân váy xếp ly thanh lịch'),
(18, 2, 'Men''s Shoes', 'mens-shoes', 'Footprints', 'Giày thể thao sneaker nam, giày da công sở, giày chạy bộ'),
(19, 2, 'Women''s Shoes', 'womens-shoes', 'Footprints', 'Giày cao gót, giày búp bê, sneaker nữ êm chân và sandal'),
(20, 2, 'Women''s Bags', 'womens-bags', 'Briefcase', 'Túi xách nữ da thật, túi đeo chéo, ví cầm tay và balo du lịch'),
(21, 2, 'Watches', 'watches', 'Watch', 'Đồng hồ thể thao chống nước, đồng hồ cơ automatic và smartwatch'),

-- Nhóm 3: Gia đình & Đời sống
(22, 3, 'Home & Living', 'home-living', 'Home', 'Nội thất gia đình, chăn ga gối nệm, dụng cụ nấu bếp cao cấp'),
(23, 3, 'Smart Home & Appliances', 'smart-home-appliances', 'Coffee', 'Thiết bị nhà thông minh, máy hút bụi robot, nồi chiên không dầu'),
(24, 3, 'Pet Supplies', 'pet-supplies', 'Box', 'Thức ăn dinh dưỡng thú cưng, pate cho mèo, phụ kiện chăm sóc chó mèo'),

-- Nhóm 4: Làm đẹp & Sức khỏe
(25, 4, 'Beauty', 'beauty', 'Sparkles', 'Serum dưỡng ẩm, kem chống nắng kiềm dầu, son môi và đồ trang điểm'),
(26, 4, 'Health', 'health', 'HeartPulse', 'Thực phẩm chức năng, vitamin tổng hợp, máy đo huyết áp tại nhà'),
(27, 4, 'Mom & Baby', 'mom-baby', 'Baby', 'Tã bỉm trẻ em, bình sữa kháng khuẩn, sữa bột dinh dưỡng và xe đẩy'),

-- Nhóm 5: Thể thao, Xe & Tiện ích
(28, 5, 'Sports & Outdoors', 'sports-outdoors', 'Dumbbell', 'Dụng cụ tập gym, yoga, lều cắm trại dã ngoại ngoài trời'),
(29, 5, 'Automotive', 'automotive', 'Car', 'Phụ kiện ô tô xe máy, cần gạt nước mưa, bơm lốp điện tử, lốp xe'),
(30, 5, 'Books & Stationery', 'books-stationery', 'Book', 'Sách kỹ năng sống, văn học, bút ký cao cấp và sổ tay'),
(31, 5, 'Groceries', 'groceries', 'Store', 'Cà phê hòa tan, hạt nêm, trà, bánh kẹo và thực phẩm thiết yếu'),
(32, 5, 'Gifts', 'gifts', 'Gift', 'Bộ đồ chơi xếp hình LEGO, hộp quà lưu niệm, nến thơm cao cấp'),
(33, 5, 'Vouchers', 'vouchers', 'Ticket', 'E-voucher giảm giá mua sắm ShopeePay, thẻ quà tặng và mã dịch vụ');

SELECT setval('categories_id_seq', 33);

-- ------------------------------------------------------------------------------
-- 4. SEED BRANDS (35 Thương hiệu toàn cầu nổi tiếng chuẩn hóa độc lập 3NF)
-- ------------------------------------------------------------------------------
INSERT INTO Brands (id, name, slug, logo_url, origin_country, description) VALUES
(1, 'Apple', 'apple', 'https://cdn.simpleicons.org/apple/white', 'Hoa Kỳ', 'Hệ sinh thái công nghệ iPhone, iPad, Mac và phụ kiện cao cấp'),
(2, 'Samsung', 'samsung', 'https://cdn.simpleicons.org/samsung/white', 'Hàn Quốc', 'Tập đoàn đa quốc gia đứng đầu về màn hình, bán dẫn và smartphone'),
(3, 'Sony', 'sony', 'https://cdn.simpleicons.org/sony/white', 'Nhật Bản', 'Thương hiệu hàng đầu về thiết bị âm thanh, máy ảnh và máy chơi game PS5'),
(4, 'Nike', 'nike', 'https://cdn.simpleicons.org/nike/white', 'Hoa Kỳ', 'Thương hiệu thời trang thể thao và giày chạy bộ số một thế giới'),
(5, 'Adidas', 'adidas', 'https://cdn.simpleicons.org/adidas/white', 'Đức', 'Biểu tượng thể thao 3 sọc kinh điển toàn cầu'),
(6, 'Nintendo', 'nintendo', 'https://cdn.simpleicons.org/nintendo/white', 'Nhật Bản', 'Hãng game huyền thoại nổi tiếng với máy Switch và game Mario'),
(7, 'Dyson', 'dyson', 'https://cdn.simpleicons.org/dyson/white', 'Vương Quốc Anh', 'Thiết bị gia dụng công nghệ cao với máy hút bụi và chăm sóc tóc'),
(8, 'LG', 'lg', 'https://cdn.simpleicons.org/lg/white', 'Hàn Quốc', 'Tập đoàn điện tử gia dụng hàng đầu thế giới với tấm nền OLED'),
(9, 'Canon', 'canon', 'https://cdn.simpleicons.org/canon/white', 'Nhật Bản', 'Thương hiệu máy ảnh quang học và ống kính chuyên nghiệp số một thế giới'),
(10, 'Casio', 'casio', 'https://cdn.simpleicons.org/casio/white', 'Nhật Bản', 'Hãng đồng hồ thể thao G-Shock siêu bền và đồng hồ điện tử kinh điển'),
(11, 'Rolex', 'rolex', 'https://cdn.simpleicons.org/rolex/white', 'Thụy Sĩ', 'Thương hiệu đồng hồ xa xỉ cơ học biểu tượng của sự thành đạt'),
(12, 'L''Oreal', 'loreal', 'https://cdn.simpleicons.org/loreal/white', 'Pháp', 'Tập đoàn mỹ phẩm và chăm sóc sắc đẹp hàng đầu hành tinh'),
(13, 'Maybelline', 'maybelline', 'https://cdn.simpleicons.org/maybelline/white', 'Hoa Kỳ', 'Thương hiệu trang điểm thời thượng nổi tiếng thế giới'),
(14, 'Pampers', 'pampers', 'https://cdn.simpleicons.org/pampers/white', 'Hoa Kỳ', 'Thương hiệu tã bỉm trẻ em được tin dùng nhất toàn cầu'),
(15, 'Huggies', 'huggies', 'https://cdn.simpleicons.org/huggies/white', 'Hoa Kỳ', 'Thương hiệu chăm sóc mẹ và bé uy tín hàng đầu'),
(16, 'Gucci', 'gucci', 'https://cdn.simpleicons.org/gucci/white', 'Ý', 'Nhà mốt thời trang và phụ kiện xa xỉ bậc nhất thế giới'),
(17, 'Chanel', 'chanel', 'https://cdn.simpleicons.org/chanel/white', 'Pháp', 'Biểu tượng thời trang haute couture thanh lịch và nước hoa di sản'),
(18, 'Charles & Keith', 'charles-keith', 'https://cdn.simpleicons.org/charleskeith/white', 'Singapore', 'Thương hiệu túi xách và giày dép nữ thời trang trendy châu Á'),
(19, 'Dell', 'dell', 'https://cdn.simpleicons.org/dell/white', 'Hoa Kỳ', 'Thương hiệu máy tính xách tay và màn hình đồ họa chuyên nghiệp'),
(20, 'Asus', 'asus', 'https://cdn.simpleicons.org/asus/white', 'Đài Loan', 'Tập đoàn phần cứng máy tính và thương hiệu gaming Republic of Gamers'),
(21, 'Logitech', 'logitech', 'https://cdn.simpleicons.org/logitech/white', 'Thụy Sĩ', 'Hãng thiết bị ngoại vi, chuột và bàn phím máy tính hàng đầu'),
(22, 'JBL', 'jbl', 'https://cdn.simpleicons.org/jbl/white', 'Hoa Kỳ', 'Thương hiệu loa bluetooth di động âm thanh mạnh mẽ đỉnh cao'),
(23, 'Marshall', 'marshall', 'https://cdn.simpleicons.org/marshall/white', 'Vương Quốc Anh', 'Thương hiệu âm thanh rock-and-roll cổ điển huyền thoại'),
(24, 'Bosch', 'bosch', 'https://cdn.simpleicons.org/bosch/white', 'Đức', 'Tập đoàn công nghệ và thiết bị cơ khí phụ tùng ô tô số 1 châu Âu'),
(25, 'Michelin', 'michelin', 'https://cdn.simpleicons.org/michelin/white', 'Pháp', 'Thương hiệu lốp xe cao cấp và bản đồ ẩm thực nổi tiếng thế giới'),
(26, 'Nestle', 'nestle', 'https://cdn.simpleicons.org/nestle/white', 'Thụy Sĩ', 'Tập đoàn thực phẩm và nước giải khát dinh dưỡng lớn nhất thế giới'),
(27, 'Unilever', 'unilever', 'https://cdn.simpleicons.org/unilever/white', 'Hà Lan', 'Tập đoàn hàng tiêu dùng nhanh với các thương hiệu Knorr, Omo, Lifebuoy'),
(28, 'Fahasa', 'fahasa', 'https://cdn.simpleicons.org/fahasa/white', 'Việt Nam', 'Hệ thống nhà sách và xuất bản phẩm văn hóa lớn nhất Việt Nam'),
(29, 'Thien Long', 'thien-long', 'https://cdn.simpleicons.org/thienlong/white', 'Việt Nam', 'Tập đoàn sản xuất bút viết và dụng cụ văn phòng phẩm quốc gia'),
(30, 'Royal Canin', 'royal-canin', 'https://cdn.simpleicons.org/royalcanin/white', 'Pháp', 'Hãng dinh dưỡng chuyên sâu cho chó và mèo chuẩn thú y quốc tế'),
(31, 'LEGO', 'lego', 'https://cdn.simpleicons.org/lego/white', 'Đan Mạch', 'Tập đoàn đồ chơi xếp hình phát triển tư duy sáng tạo số 1 hành tinh'),
(32, 'ShopeePay', 'shopeepay', 'https://cdn.simpleicons.org/shopee/white', 'Singapore', 'Hệ sinh thái thanh toán số và ví điện tử tích hợp sàn Shopee'),
(33, 'Coolmate', 'coolmate', 'https://cdn.simpleicons.org/coolmate/white', 'Việt Nam', 'Thương hiệu giải pháp mua sắm thời trang nam cơ bản tiện lợi'),
(34, 'Uniqlo', 'uniqlo', 'https://cdn.simpleicons.org/uniqlo/white', 'Nhật Bản', 'Thương hiệu thời trang ứng dụng LifeWear tối giản và chất lượng'),
(35, 'Lock&Lock', 'lock-lock', 'https://cdn.simpleicons.org/locklock/white', 'Hàn Quốc', 'Thương hiệu hộp bảo quản thực phẩm và đồ dùng nhà bếp cao cấp');

SELECT setval('brands_id_seq', 35);

-- ------------------------------------------------------------------------------
-- 5. SEED CATEGORY_BRANDS (Gắn kết các Thương hiệu vào từng Danh mục tương ứng)
-- ------------------------------------------------------------------------------
INSERT INTO Category_Brands (category_id, brand_id) VALUES
-- Smartphones & Accessories
(10, 1), (10, 2),
-- Electronics
(11, 2), (11, 3), (11, 8), (11, 20),
-- Laptops & Computers
(12, 1), (12, 19), (12, 20), (12, 21),
-- Cameras
(13, 3), (13, 9),
-- Audio
(14, 1), (14, 3), (14, 22), (14, 23),
-- Gaming
(15, 3), (15, 6), (15, 20), (15, 21),
-- Men's Fashion
(16, 4), (16, 5), (16, 33), (16, 34),
-- Women's Fashion
(17, 16), (17, 17), (17, 34),
-- Men's Shoes
(18, 4), (18, 5),
-- Women's Shoes
(19, 4), (19, 5), (19, 18),
-- Women's Bags
(20, 16), (20, 17), (20, 18),
-- Watches
(21, 1), (21, 10), (21, 11),
-- Home & Living
(22, 24), (22, 35),
-- Smart Home & Appliances
(23, 7), (23, 8), (23, 24),
-- Pet Supplies
(24, 30),
-- Beauty
(25, 12), (25, 13),
-- Health
(26, 24), (26, 27),
-- Mom & Baby
(27, 14), (27, 15),
-- Sports & Outdoors
(28, 4), (28, 5),
-- Automotive
(29, 24), (29, 25),
-- Books & Stationery
(30, 28), (30, 29),
-- Groceries
(31, 26), (31, 27),
-- Gifts
(32, 31),
-- Vouchers
(33, 32);

-- ------------------------------------------------------------------------------
-- 6. SEED PRODUCTS (Gần 80 sản phẩm phân bố đều cho TẤT CẢ 24 DANH MỤC)
-- Đảm bảo mỗi danh mục có ít nhất 3-4 sản phẩm thật, hình ảnh chuẩn, giá & tồn kho
-- ------------------------------------------------------------------------------
INSERT INTO Products (id, shop_id, category_id, brand_id, sku, name, description, price, original_price, stock, sold_count, rating_avg, review_count, image_url) VALUES

-- [1] Smartphones & Accessories (category_id: 10)
(1, 1, 10, 1, 'APL-IP15PM-256', 'Apple iPhone 15 Pro Max 256GB - Khung Titanium Tự Nhiên', 'Thiết kế titanium siêu bền nhẹ, chip A17 Pro gaming cực đỉnh và camera tiềm vọng quang học 5x sắc nét.', 1199.00, 1399.00, 85, 342, 4.95, 88, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'),
(2, 3, 10, 2, 'SAM-S24U-512', 'Samsung Galaxy S24 Ultra 512GB (Titanium Gray, Galaxy AI)', 'Quyền năng Galaxy AI dịch thuật trực tiếp, camera 200MP zoom mắt thần bóng đêm và bút S-Pen tích hợp.', 1299.00, 1499.00, 70, 275, 4.90, 64, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=800'),
(3, 1, 10, 1, 'APL-CASE-15PM', 'Ốp Lưng Apple MagSafe Silicon Trong Suốt iPhone 15 Pro Max', 'Chất liệu polycarbonate quang học trong suốt, chống ố vàng và tích hợp nam châm hít sạc không dây MagSafe.', 49.00, 59.00, 150, 520, 4.80, 42, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&q=80&w=800'),
(4, 3, 10, 2, 'SAM-CHG-45W', 'Củ Sạc Nhanh Samsung Type-C 45W Power Adapter Kèm Cáp', 'Công nghệ sạc siêu nhanh Super Fast Charging 2.0 an toàn, tự ngắt khi đầy pin cho Galaxy S24 và máy tính bảng.', 35.00, 45.00, 120, 680, 4.85, 95, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800'),

-- [2] Electronics (category_id: 11)
(5, 3, 11, 8, 'LG-C3-65OLED', 'Smart TV LG OLED evo C3 65 inch 4K 120Hz Dolby Vision', 'Tấm nền OLED tự phát sáng rực rỡ, bộ xử lý a9 AI Gen6 cho trải nghiệm điện ảnh và chơi game console mượt mà.', 1699.00, 2199.00, 15, 62, 4.92, 18, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800'),
(6, 4, 11, 20, 'ASUS-ROG-OLED27', 'Màn Hình Gaming Asus ROG Swift OLED 27" 240Hz 0.03ms QHD', 'Tần số quét 240Hz cực nhanh, độ trễ 0.03ms và tấm nền OLED chuẩn màu cho game thủ thể thao điện tử chuyên nghiệp.', 799.00, 899.00, 28, 115, 4.88, 32, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800'),
(7, 3, 11, 2, 'SAM-PROJ-FREE2', 'Máy Chiếu Mini Thông Minh Samsung The Freestyle Gen 2', 'Thiết kế xoay 180 độ chiếu mọi bề mặt tường trần, tự động cân chỉnh hình ảnh và tích hợp loa 360 độ sống động.', 549.00, 699.00, 35, 94, 4.75, 21, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800'),

-- [3] Laptops & Computers (category_id: 12)
(8, 1, 12, 1, 'APL-MBP14-M3', 'Apple MacBook Pro 14" M3 Pro (18GB RAM, 512GB SSD) Space Black', 'Hiệu năng đồ họa chuyên nghiệp cho lập trình viên và creator. Thời lượng pin lên đến 18 tiếng liên tục.', 1999.00, 2299.00, 40, 128, 4.98, 45, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'),
(9, 4, 12, 19, 'DEL-XPS15-9530', 'Laptop Dell XPS 15 9530 Core i7-13700H (16GB, 512GB, RTX 4060)', 'Viền màn hình InfinityEdge siêu mỏng, vỏ nhôm CNC nguyên khối kết hợp chiếu nghỉ tay carbon sang trọng.', 1849.00, 2099.00, 22, 76, 4.82, 19, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800'),
(10, 4, 12, 21, 'LOG-MXM-3S', 'Chuột Công Thái Học Không Dây Logitech MX Master 3S Quiet', 'Cảm biến 8000 DPI lướt êm trên mặt kính, con lăn điện từ MagSpeed cuộn 1000 dòng/giây và click siêu êm.', 99.00, 119.00, 85, 430, 4.90, 72, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800'),
(11, 1, 12, 1, 'APL-MGM-WHT', 'Apple Magic Mouse - Cảm Ứng Đa Điểm Bề Mặt Kính', 'Chuột Bluetooth không dây chính hãng Apple với thiết kế tối giản, hỗ trợ cử chỉ vuốt chuyển trang mượt mà.', 79.00, 99.00, 95, 210, 4.70, 38, 'https://images.unsplash.com/photo-1605774337664-7a846e9cdf17?auto=format&fit=crop&q=80&w=800'),

-- [4] Cameras (category_id: 13)
(12, 4, 13, 9, 'CAN-EOS-R50', 'Máy Ảnh Mirrorless Canon EOS R50 Kèm Lens Kit RF-S 18-45mm', 'Cảm biến CMOS APS-C 24.2MP, quay phim 4K 30p sắc nét và hệ thống lấy nét Dual Pixel CMOS AF II thông minh.', 679.00, 799.00, 30, 88, 4.86, 25, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800'),
(13, 4, 13, 3, 'SNY-A7M4-BODY', 'Máy Ảnh Full-Frame Sony Alpha A7 Mark IV (Body Chính Hãng)', 'Độ phân giải 33MP thế hệ mới, bộ xử lý BIONZ XR và khả năng theo dõi lấy nét mắt người/động vật thời gian thực.', 2399.00, 2599.00, 18, 52, 4.95, 30, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=800'),
(14, 4, 13, 9, 'CAN-RF-50F18', 'Ống Kính Chân Dung Canon RF 50mm f/1.8 STM Cho Ngàm R', 'Khẩu độ lớn f/1.8 tạo hiệu ứng xóa phông bokeh lung linh, nhỏ gọn lý tưởng chụp ảnh đường phố và chân dung.', 169.00, 199.00, 45, 160, 4.88, 40, 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&q=80&w=800'),

-- [5] Audio (category_id: 14)
(15, 1, 14, 1, 'APL-APP2-USBC', 'Apple AirPods Pro 2 (USB-C MagSafe Charging Case)', 'Khử tiếng ồn chủ động (ANC) tốt hơn gấp 2 lần, âm thanh thích ứng và khả năng kháng bụi nước IP54.', 249.00, 299.00, 150, 520, 4.96, 120, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800'),
(16, 4, 14, 3, 'SNY-WH1000XM5', 'Tai Nghe Không Dây Sony WH-1000XM5 Noise Cancelling', 'Đỉnh cao chống ồn chủ động công nghệ kép, thời lượng pin 30 giờ và chất âm chuẩn phòng thu Hi-Res Audio.', 398.00, 449.00, 45, 185, 4.92, 54, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800'),
(17, 4, 14, 23, 'MSH-EMB2-BLK', 'Loa Bluetooth Di Động Marshall Emberton II Chính Hãng', 'Thiết kế vintage bọc da cổ điển, âm thanh đa hướng True Stereophonic 360 độ và pin bền bỉ hơn 30 tiếng.', 159.00, 189.00, 60, 290, 4.87, 65, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800'),
(18, 4, 14, 22, 'JBL-FLIP6-RED', 'Loa Di Động Kháng Nước JBL Flip 6 Âm Bass Uy Lực', 'Hệ thống loa 2 chiều mang lại âm trầm sâu lắng, chuẩn chống nước chống bụi IP67 thoải mái tiệc tùng hồ bơi.', 99.00, 129.00, 110, 415, 4.82, 88, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800'),

-- [6] Gaming (category_id: 15)
(19, 4, 15, 3, 'SNY-PS5-SLIM', 'Máy Chơi Game Sony PlayStation 5 Slim Disc Edition 1TB', 'Tận hưởng sức mạnh load game thần tốc với ổ SSD siêu tốc và phản hồi xúc giác chân thực của tay cầm DualSense.', 499.00, 550.00, 35, 380, 4.95, 95, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800'),
(20, 4, 15, 6, 'NTD-SW-OLED', 'Máy Chơi Game Nintendo Switch OLED Model White Joy-Con', 'Màn hình OLED 7-inch sống động, chân đế đa năng và trải nghiệm linh hoạt giữa chế độ Handheld và TV gia đình.', 349.00, 399.00, 50, 420, 4.91, 102, 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=800'),
(21, 4, 15, 21, 'LOG-G915-TKL', 'Bàn Phím Cơ Gaming Không Dây Logitech G915 TKL Lightspeed', 'Switch cơ học Low-Profile siêu nhạy, vỏ hợp kim nhôm phay xước cao cấp và LED RGB Lightsync tùy biến.', 189.00, 229.00, 40, 175, 4.83, 34, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800'),
(22, 4, 15, 3, 'SNY-DUALSENSE-W', 'Tay Cầm Chơi Game DualSense Wireless Controller PS5 Trắng', 'Cò bấm thích ứng Adaptive Triggers và rung phản hồi xúc giác mang đến trải nghiệm nhập vai chân thực.', 69.00, 79.00, 85, 310, 4.89, 58, 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&q=80&w=800'),

-- [7] Men's Fashion (category_id: 16)
(23, 2, 16, 33, 'CLM-SHIRT-BAM', 'Áo Sơ Mi Nam Sợi Tre Bamboo Coolmate Dài Tay Chống Nhăn', 'Chất liệu vải sợi tre tự nhiên thoáng mát, thấm hút mồ hôi vượt trội và tôn dáng lịch thiệp cho nam giới.', 22.00, 29.00, 130, 560, 4.84, 82, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800'),
(24, 2, 16, 33, 'CLM-POLO-JAC', 'Áo Polo Nam Aristino Regular Fit Dệt Họa Tiết Jacquard', 'Form dáng ôm vừa vặn, cổ áo dệt gân đứng phom sang trọng, thích hợp đi làm văn phòng hay gặp gỡ đối tác.', 28.00, 35.00, 90, 320, 4.80, 46, 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&q=80&w=800'),
(25, 2, 16, 34, 'UNQ-JEAN-SLIM', 'Quần Jeans Nam Uniqlo Slim Fit Co Giãn 4 Chiều Cao Cấp', 'Công nghệ denim cải tiến mềm nhẹ, co giãn thoải mái cho mọi hoạt động di chuyển và đứng ngồi cả ngày.', 39.00, 49.00, 75, 245, 4.88, 39, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800'),
(26, 2, 16, 4, 'NKE-NSW-CLUB', 'Áo Hoodie Thể Thao Nike Sportswear Club Fleece Unisex', 'Chất nỉ bông mềm mại ấm áp, thêu logo Nike Futura kinh điển trước ngực, form rộng trẻ trung năng động.', 65.00, 80.00, 80, 450, 4.90, 70, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800'),

-- [8] Women's Fashion (category_id: 17)
(27, 2, 17, 16, 'GUC-DRESS-MIDI', 'Đầm Nữ Dự Tiệc Dáng Xòe Gucci Style Đính Nơ Cổ Điển', 'Họa tiết vintage quý phái, chất liệu voan lụa bồng bềnh giúp tôn vinh vóc dáng yêu kiều của phái đẹp.', 79.00, 99.00, 45, 130, 4.86, 28, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800'),
(28, 2, 17, 34, 'UNQ-BLOUSE-RAY', 'Áo Sơ Mi Lụa Nữ Uniqlo Dáng Suông Nhẹ Mát Công Sở', 'Vải rayon cao cấp chống nhăn tự nhiên, dễ ủi giặt và mang đến vẻ đẹp tối giản thanh lịch hàng ngày.', 29.00, 39.00, 80, 270, 4.82, 44, 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=800'),
(29, 2, 17, 17, 'CHN-SKIRT-MIDI', 'Chân Váy Xếp Ly Midi Dáng Dài Chanel Inspired Thanh Lịch', 'Thiết kế xếp ly tỉ mỉ, cạp cao tôn eo thon, dễ dàng kết hợp cùng áo len hoặc blazer xuống phố mùa thu.', 45.00, 59.00, 60, 195, 4.87, 35, 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=800'),

-- [9] Men's Shoes (category_id: 18)
(30, 2, 18, 4, 'NKE-AF1-07W', 'Giày Sneaker Nike Air Force 1 07 All-White Classic', 'Mẫu sneaker bất hủ mọi thời đại, chất liệu da bóng mượt, đệm Air êm ái hỗ trợ tối đa cho các hoạt động.', 115.00, 135.00, 120, 680, 4.96, 115, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800'),
(31, 2, 18, 5, 'ADI-UB-LIGHT', 'Giày Chạy Bộ Nam Adidas Ultraboost Light Đệm Boost Cực Êm', 'Trọng lượng nhẹ hơn 30% so với thế hệ trước, hoàn trả năng lượng tối đa trên từng bước sải chân chạy.', 159.00, 190.00, 65, 340, 4.91, 58, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=800'),
(32, 2, 18, 4, 'NKE-PEG40-BLK', 'Giày Chạy Bộ Nike Air Zoom Pegasus 40 React Foam', 'Độ đàn hồi vượt trội kết hợp đệm Zoom kép giúp bạn bứt phá từng cung đường chạy marathon dài ngày.', 130.00, 150.00, 65, 310, 4.88, 49, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'),

-- [10] Women's Shoes (category_id: 19)
(33, 2, 19, 18, 'CK-PUMP-DORSAY', 'Giày Cao Gót Nữ Charles & Keith Mũi Nhọn D''Orsay 7cm', 'Phom dáng thanh mảnh, lớp lót đệm êm chân không gây đau mỏi, phù hợp các buổi tiệc và sự kiện quan trọng.', 59.00, 75.00, 70, 280, 4.85, 48, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800'),
(34, 2, 19, 5, 'ADI-SUPERSTAR-W', 'Giày Sneaker Nữ Adidas Superstar Classic Mũi Sò', 'Biểu tượng đường phố với mũi giày vỏ sò bảo vệ ngón chân, phối 3 sọc đen tương phản nổi bật cá tính.', 89.00, 105.00, 85, 420, 4.89, 75, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800'),
(35, 2, 19, 18, 'CK-SANDAL-STRAP', 'Giày Sandal Nữ Quai Mảnh Charles & Keith Gót Vuông 5cm', 'Quai dây mảnh tinh tế ôm trọn cổ chân, đế chống trượt chắc chắn, dễ phối cùng đầm xòe hoặc quần culottes.', 49.00, 62.00, 60, 175, 4.80, 29, 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&q=80&w=800'),

-- [11] Women's Bags (category_id: 20)
(36, 2, 20, 18, 'CK-BAG-TRAPEZE', 'Túi Xách Tay Nữ Charles & Keith Form Hộp Khóa Kim Loại', 'Chất da nhân tạo cao cấp dập vân mịn, kèm dây đeo chéo linh hoạt chuyển đổi giữa cầm tay và đeo vai.', 69.00, 85.00, 55, 320, 4.88, 52, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'),
(37, 2, 20, 16, 'GUC-MARMONT-MINI', 'Túi Đeo Chéo Nữ Gucci GG Marmont Matelasse Da Thật', 'Họa tiết chần bông chevron sang trọng, logo đôi G kim loại mạ vàng cổ điển và khóa kéo tiện dụng.', 499.00, 599.00, 18, 65, 4.96, 20, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800'),
(38, 2, 20, 18, 'CK-BACKPACK-NYL', 'Balo Nữ Thời Trang Chống Thấm Nước Mini Charles & Keith', 'Thiết kế trẻ trung đa ngăn đựng đồ cá nhân, chất vải chống thấm nước mưa nhẹ khi di chuyển du lịch.', 55.00, 69.00, 40, 140, 4.79, 22, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800'),

-- [12] Watches (category_id: 21)
(39, 7, 21, 10, 'CSO-GA2100-1A', 'Đồng Hồ Nam Casio G-Shock GA-2100 "CasiOak" Chống Nước 200m', 'Vành bát giác mỏng nhẹ, cấu trúc bảo vệ lõi carbon siêu bền chịu va đập cực tốt và chống nước 200 mét.', 99.00, 125.00, 80, 480, 4.94, 95, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800'),
(40, 7, 21, 11, 'RLX-SUB-DATE', 'Đồng Hồ Cơ Tự Động Rolex Submariner Date Mặt Đen Huyền Thoại', 'Vành xoay gốm Cerachrom chống trầy, thép không gỉ Oystersteel và kính phóng đại Cyclops xem lịch ngày.', 4999.00, 5499.00, 8, 24, 4.98, 12, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800'),
(41, 1, 21, 1, 'APL-WATCH-S9', 'Đồng Hồ Thông Minh Apple Watch Series 9 GPS 45mm Vỏ Nhôm', 'Chip S9 SiP mạnh mẽ với cử chỉ chạm 2 lần Double Tap độc đáo, đo nồng độ oxy trong máu và điện tâm đồ ECG.', 399.00, 429.00, 65, 295, 4.90, 60, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800'),
(42, 7, 21, 10, 'CSO-SHEEN-SW', 'Đồng Hồ Nữ Casio Sheen Đính Đá Swarovski Sang Trọng', 'Mặt kính Sapphire chống xước hoàn hảo, đính đá lấp lánh phản chiếu ánh sáng và dây kim loại mạ bạc tinh tế.', 115.00, 145.00, 45, 160, 4.85, 30, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800'),

-- [13] Home & Living (category_id: 22)
(43, 6, 22, 35, 'LNL-BED-TENCEL', 'Bộ Chăn Ga Gối Lụa Tencel Lock&Lock 4 Món Mềm Mại', 'Sợi vải cellulose sinh học thân thiện với làn da, thoáng khí mượt mà cho giấc ngủ sâu sảng khoái.', 89.00, 120.00, 50, 215, 4.86, 38, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800'),
(44, 6, 22, 35, 'LNL-COOK-SET3', 'Bộ Nồi Chảo Chống Dính Đáy Từ Lock&Lock Deco Inox 3 Món', 'Lớp phủ titanium chống dính bền bỉ, sử dụng tốt trên mọi loại bếp từ, bếp gas và bếp hồng ngoại.', 75.00, 99.00, 40, 180, 4.82, 34, 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&q=80&w=800'),
(45, 6, 22, 35, 'LNL-THERMOS-500', 'Bình Giữ Nhiệt Lock&Lock Feather Light 500ml Inox 304', 'Trọng lượng siêu nhẹ chỉ 230g, giữ nóng suốt 8 tiếng và giữ lạnh 12 tiếng liên tục không đọng sương.', 18.00, 25.00, 140, 670, 4.91, 110, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800'),

-- [14] Smart Home & Appliances (category_id: 23)
(46, 3, 23, 7, 'DYS-V15-DET', 'Máy Hút Bụi Không Dây Dyson V15 Detect Absolute Tia Laser', 'Công nghệ chiếu laser phát hiện bụi vi mô vô hình, lực hút xoáy cực đại và đầu hút chống rối tóc độc quyền.', 749.00, 899.00, 25, 95, 4.95, 24, 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800'),
(47, 6, 23, 24, 'BOS-BLENDER-800', 'Máy Xay Sinh Tố Cầm Tay Đa Năng Bosch ErgoMixx 800W', 'Lưỡi dao 4 cánh QuattroBlade sắc bén xay nhuyễn mịn đá và thực phẩm cứng chỉ trong vài giây.', 65.00, 85.00, 55, 230, 4.84, 45, 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&q=80&w=800'),
(48, 3, 23, 8, 'LG-PURIFIER-AER', 'Máy Lọc Không Khí Cao Cấp LG PuriCare 360 Hit Màng HEPA', 'Bộ lọc 3 lớp diệt khuẩn 99.9% bụi mịn PM0.01 và cảm biến chất lượng không khí hiển thị theo màu thông minh.', 189.00, 249.00, 30, 110, 4.88, 28, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800'),

-- [15] Pet Supplies (category_id: 24)
(49, 6, 24, 30, 'RC-CAT-IND-2K', 'Thức Ăn Hạt Cho Mèo Nuôi Trong Nhà Royal Canin Indoor 2kg', 'Giảm mùi hôi chất thải, kiểm soát búi lông đường ruột và duy trì cân nặng lý tưởng cho mèo cưng.', 22.00, 28.00, 95, 420, 4.92, 85, 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=800'),
(50, 6, 24, 30, 'RC-DOG-MINI-2K', 'Thức Ăn Hạt Cho Chó Cỡ Nhỏ Royal Canin Mini Adult 2kg', 'Đáp ứng nhu cầu năng lượng cao của giống chó nhỏ, hỗ trợ sức khỏe răng miệng và làm bóng mượt lông.', 24.00, 30.00, 80, 310, 4.89, 60, 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&q=80&w=800'),
(51, 6, 24, 30, 'RC-CAN-POUCH12', 'Pate Cho Mèo Trưởng Thành Royal Canin Instinctive Thùng 12 Gói', 'Nước sốt thịt đậm đà kích thích vị giác mèo lười ăn, cân đối tỷ lệ protein và khoáng chất tối ưu.', 16.00, 20.00, 110, 520, 4.87, 92, 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800'),

-- [16] Beauty (category_id: 25)
(52, 5, 25, 12, 'LOR-SERUM-GLY', 'Serum Dưỡng Sáng Mờ Thâm L''Oreal Paris Glycolic-Bright 30ml', 'Chứa phức hợp 1% Glycolic Acid giúp tẩy tế bào chết nhẹ nhàng, làm mờ vết thâm mụn chỉ sau 2 tuần.', 16.00, 22.00, 150, 780, 4.91, 140, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800'),
(53, 5, 25, 13, 'MAY-LIP-MATTE', 'Son Kem Lì Lâu Trôi 16H Maybelline Superstay Matte Ink 5ml', 'Chất son chuẩn màu không lem, không trôi khi ăn uống, bảng màu thời thượng tôn mọi sắc tố da.', 9.00, 13.00, 200, 1150, 4.88, 210, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800'),
(54, 5, 25, 12, 'LOR-SUN-DEF', 'Kem Chống Nắng Kiểm Soát Dầu L''Oreal Paris UV Defender 50ml', 'Chỉ số bảo vệ SPF50+ PA++++ với hoạt chất Niacinamide giúp kiềm dầu suốt 8 tiếng không bóng nhờn.', 14.00, 19.00, 120, 630, 4.86, 110, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800'),

-- [17] Health (category_id: 26)
(55, 6, 26, 24, 'BOS-HEALTH-BP', 'Máy Đo Huyết Áp Bắp Tay Kỹ Thuật Số Tự Động Chuẩn Y Tế', 'Màn hình LCD lớn hiển thị chỉ số nhịp tim và huyết áp rõ ràng, lưu trữ 60 kết quả đo cho 2 người dùng.', 39.00, 49.00, 70, 260, 4.89, 45, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800'),
(56, 6, 26, 27, 'UNL-LIFE-WASH', 'Gel Rửa Tay Khô Diệt Khuẩn 99.9% Chai 500ml Tiện Lợi', 'Công thức bảo vệ da tay với chiết xuất trà xanh thiên nhiên, giữ ẩm dịu nhẹ và diệt sạch vi khuẩn gây hại.', 5.00, 7.00, 300, 1450, 4.85, 180, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800'),
(57, 5, 26, 12, 'LOR-MICEL-WATER', 'Nước Tẩy Trang Tươi Mát Cho Da Nhạy Cảm L''Oreal Micellar 400ml', 'Công nghệ phân tử micellar hút sạch cặn trang điểm và bụi mịn mà không gây khô rát hay cay mắt.', 8.00, 11.00, 160, 890, 4.90, 135, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800'),

-- [18] Mom & Baby (category_id: 27)
(58, 6, 27, 14, 'PAM-DIAP-DRY-L', 'Tã Quần Cao Cấp Pampers Baby Dry Khô Thoáng Size L 54 Miếng', 'Hạt gel thần kỳ thấm hút gấp 3 lần, đai lưng co giãn 360 độ êm ái chống tràn hiệu quả suốt đêm dài.', 17.00, 23.00, 110, 520, 4.93, 98, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800'),
(59, 6, 27, 15, 'HUG-DIAP-PLAT', 'Tã Dán Sơ Sinh Huggies Platinum Nature Made Siêu Mềm Size NB', 'Chất liệu sợi tơ thiên nhiên 100% nhập khẩu từ châu Âu nâng niu làn da non nớt của trẻ sơ sinh.', 15.00, 20.00, 130, 610, 4.90, 112, 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&q=80&w=800'),
(60, 6, 27, 15, 'HUG-WIPES-3PK', 'Khăn Ướt Em Bé Huggies Tinh Chất Tràm Trà Lốc 3 Gói (64 Miếng/Gói)', 'Không chứa cồn, không paraben, an toàn tuyệt đối lau miệng và tay chân cho bé yêu hàng ngày.', 6.00, 9.00, 250, 1400, 4.87, 160, 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=800'),

-- [19] Sports & Outdoors (category_id: 28)
(61, 8, 28, 4, 'NKE-YOGA-MAT', 'Thảm Tập Yoga Nike Chống Trơn Trượt TPE 8mm Kèm Dây Đeo', 'Chất liệu bọt cao su sinh thái êm ái đàn hồi, hoa văn dập nổi chống trượt tối đa cho các tư thế asana.', 35.00, 45.00, 85, 390, 4.88, 62, 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800'),
(62, 8, 28, 5, 'ADI-DUMB-10K', 'Bộ Tạ Tay Tập Gym Adidas Rubber Hex Cặp 5kg x 2 Quả', 'Thiết kế lục giác chống lăn trượt trên sàn nhà, bọc cao su giảm chấn bảo vệ mặt sàn khi rơi rớt.', 39.00, 49.00, 60, 240, 4.82, 41, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=800'),
(63, 2, 28, 4, 'NKE-BRASILIA-M', 'Túi Trống Thể Thao Tập Gym Nike Brasilia 9.5 Ngăn Giày Riêng', 'Khoang chứa đồ rộng rãi 60 lít kèm ngăn thông hơi đựng giày tập riêng biệt, quai đeo đệm vai êm ái.', 35.00, 45.00, 75, 310, 4.91, 55, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800'),

-- [20] Automotive (category_id: 29)
(64, 8, 29, 24, 'BOS-AEROTWIN', 'Cặp Cần Gạt Mưa Silicon Ô Tô Bosch Aerotwin Không Xương', 'Lưỡi gạt cao su phủ than chì Graphite quét sạch nước êm ái không để lại vệt mờ ở tốc độ cao.', 24.00, 32.00, 90, 410, 4.90, 78, 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&q=80&w=800'),
(65, 8, 29, 25, 'MCH-PRIMACY-16', 'Lốp Xe Ô Tô Du Lịch Michelin Primacy 4 205/55R16 Êm Ái', 'Khoảng cách phanh ngắn hơn khi đường trơn ướt, độ ồn thấp nhất phân khúc cho hành trình thư thái.', 95.00, 115.00, 40, 120, 4.94, 25, 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800'),
(66, 8, 29, 24, 'BOS-SMART-PUMP', 'Bơm Lốp Điện Tử Mini Cầm Tay Ô Tô Xe Máy Pin Sạc Bosch', 'Tự động ngắt khi đạt mức áp suất cài đặt, tích hợp đèn LED chiếu sáng ban đêm và sạc qua cổng Type-C.', 49.00, 65.00, 55, 280, 4.87, 52, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800'),

-- [21] Books & Stationery (category_id: 30)
(67, 6, 30, 28, 'FHS-DAC-NHAN-TAM', 'Sách "Đắc Nhân Tâm" (Khổ Lớn Bìa Cứng First News Fahasa)', 'Tác phẩm bất hủ của Dale Carnegie về nghệ thuật thu phục lòng người và giao tiếp thành công trong cuộc sống.', 5.00, 8.00, 160, 1250, 4.97, 340, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'),
(68, 6, 30, 29, 'TL-BIZNER-PEN', 'Bộ Bút Ký Kim Loại Cao Cấp Thiên Long Bizner Kèm Hộp Quà', 'Ngòi bút bi mạ vàng 18K viết êm trơn tru, thân bút khắc hoa văn tinh xảo là món quà tặng đối tác ý nghĩa.', 18.00, 25.00, 70, 320, 4.83, 50, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=800'),
(69, 6, 30, 28, 'FHS-NOTE-LEATHER', 'Sổ Tay Da Vintage Fahasa Ruột Giấy Kẻ Ngang A5 Chống Lóa', 'Chất bìa da PU sang trọng, ruột giấy vàng ngà bảo vệ thị lực không thấm mực sang trang sau.', 9.00, 14.00, 110, 410, 4.80, 65, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=800'),

-- [22] Groceries (category_id: 31)
(70, 6, 31, 26, 'NES-CAFE-RED-200', 'Cà Phê Hòa Tan Nescafé Red Cup Đậm Đà Hũ Thủy Tinh 200g', 'Chiết xuất từ hạt cà phê Robusta tuyển chọn, hương thơm nồng nàn đánh thức sự tỉnh táo mỗi sáng sớm.', 6.00, 8.00, 200, 1600, 4.91, 260, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800'),
(71, 6, 31, 27, 'UNL-KNORR-900', 'Hạt Nêm Từ Thịt Thăn & Xương Ống Knorr Unilever Gói 900g', 'Gia vị vàng cho mọi bữa ăn gia đình Việt, mang lại vị ngọt sâu tự nhiên cho các món canh xào.', 3.00, 5.00, 300, 2200, 4.89, 310, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800'),
(72, 6, 31, 26, 'NES-MILO-BOX', 'Sữa Lúa Mạch Nestlé Milo Đậm Vị Cacao Lốc 4 Hộp x 180ml', 'Cung cấp năng lượng ProNutro bổ dưỡng và vitamin nhóm B giúp trẻ năng động suốt ngày dài học tập.', 2.00, 3.00, 250, 1850, 4.88, 220, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800'),

-- [23] Gifts (category_id: 32)
(73, 8, 32, 31, 'LEG-SW-FALCON', 'Bộ Đồ Chơi Xếp Hình LEGO Star Wars Millennium Falcon 75257', 'Mô hình tàu vũ trụ huyền thoại với 1351 chi tiết tinh xảo và 7 nhân vật minifigures chiến tranh giữa các vì sao.', 119.00, 139.00, 25, 140, 4.96, 40, 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&q=80&w=800'),
(74, 8, 32, 31, 'LEG-BOTANICAL', 'Bộ Lắp Ráp LEGO Creator Bó Hoa Dã Ngoại Botanical 10280', 'Món quà tặng tinh tế và bền lâu với các loài hoa cúc, hoa hồng, lưu ly sắc màu trang trí góc phòng lãng mạn.', 49.00, 59.00, 45, 380, 4.93, 75, 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800'),
(75, 8, 32, 31, 'GFT-CANDLE-BOX', 'Hộp Quà Tặng Nến Thơm Tinh Dầu Tự Nhiên Cao Cấp Aroma Box', 'Mùi hương gỗ đàn hương và hoa oải hương thư giãn, bọc trong hộp quà thắt nơ nhung sang trọng.', 25.00, 35.00, 80, 260, 4.87, 48, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800'),

-- [24] Vouchers (category_id: 33)
(76, 1, 33, 32, 'VOU-SHP-50K', 'E-Voucher ShopeePay Giảm 50.000đ Áp Dụng Mọi Hóa Đơn Sàn', 'Mã voucher điện tử nhận ngay qua tin nhắn, giảm trực tiếp 50K cho đơn hàng từ 150K thanh toán qua ShopeePay.', 2.00, 3.00, 500, 3500, 4.95, 450, 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800'),
(77, 1, 33, 32, 'VOU-STARBUCKS', 'Thẻ Quà Tặng Starbucks E-Gift Card Trị Giá 100.000đ Điện Tử', 'Sử dụng thanh toán trực tiếp tại mọi cửa hàng Starbucks toàn quốc hoặc nạp vào ứng dụng Starbucks Vietnam.', 4.00, 5.00, 200, 890, 4.91, 130, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800'),
(78, 1, 33, 32, 'VOU-COIN-100K', 'Gói Nạp 100.000 Shopee Xu Hoàn Tiền Tiết Kiệm Mua Sắm', 'Quy đổi 100.000 Xu trực tiếp vào ví xu tài khoản để trừ tiền mặt khi thanh toán các đơn hàng kế tiếp.', 4.00, 5.00, 350, 2100, 4.88, 290, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800'),

-- Thêm sản phẩm bổ sung chuẩn hóa nghiêm ngặt từng danh mục
(79, 2, 16, 33, 'CLM-JACKET-WIND', 'Áo Khoác Gió Nam Thể Thao Coolmate Chống Nước Chống Tia UV', 'Chất liệu vải dù cao cấp nhẹ tênh, công nghệ trượt nước bảo vệ cơ thể khi trời mưa nhỏ và cản gió lạnh hiệu quả.', 32.00, 42.00, 90, 480, 4.90, 76, 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800'),
(80, 2, 16, 4, 'CK-BELT-LTHR', 'Thắt Lưng Nam Da Bò Calvin Klein Mặt Khóa Kim Loại Xoay 2 Mặt', 'Da bò thật 100% nguyên tấm mềm mịn, khóa kim loại sang trọng xoay đảo 2 màu đen nâu tiện lợi cho nam giới.', 45.00, 60.00, 65, 310, 4.85, 52, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=800'),
(81, 2, 17, 16, 'ZRA-BLAZER-OVR', 'Áo Blazer Nữ Zara Dáng Suông 2 Lớp Công Sở Thanh Lịch', 'Form áo đứng thanh mảnh tôn dáng, đệm vai tinh tế phối cùng quần tây hoặc chân váy cực kỳ sang trọng.', 69.00, 89.00, 50, 260, 4.88, 48, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800'),
(82, 2, 17, 17, 'HM-MAXI-FLWR', 'Đầm Maxi Nữ H&M Hoa Nhí Dáng Dài Đi Biển Cổ V Duyên Dáng', 'Chất liệu voan cát mềm rũ bay bổng, hoa văn rực rỡ ngọt ngào lý tưởng cho kỳ nghỉ hè dạo phố và du lịch.', 38.00, 49.00, 70, 390, 4.86, 65, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800'),
(83, 6, 27, 14, 'PGN-BOTTLE-240', 'Bình Sữa Cổ Rộng Kháng Khuẩn Pigeon Streamline 240ml PPSU', 'Chất liệu nhựa PPSU cao cấp chịu nhiệt 180 độ C, núm ti silicon siêu mềm mô phỏng bầu ngực mẹ giúp bé bú dễ dàng.', 14.00, 18.00, 120, 620, 4.95, 130, 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800'),
(84, 8, 32, 31, 'HSB-TF-OPTIMUS', 'Mô Hình Đồ Chơi Robot Transformers Optimus Prime Hasbro 30cm', 'Biến hình linh hoạt giữa xe tải đầu kéo và robot chiến binh chỉ qua 25 bước lắp ghép, khớp nối cử động linh hoạt.', 42.00, 55.00, 55, 270, 4.92, 58, 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800'),
-- 24 Sản phẩm bổ sung cho đợt nâng cấp AI Recommendation (IDs 85 - 108)
(85, 3, 10, 2, 'GGL-PX8P-128', 'Google Pixel 8 Pro 128GB Bay Blue (Google Tensor G3, Camera AI)', 'Nhiếp ảnh điện toán đỉnh cao với chip Tensor G3, tính năng Best Take sửa ảnh thần kỳ và màn hình Super Actua Display.', 899.00, 999.00, 45, 190, 4.88, 42, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800'),
(86, 4, 11, 3, 'SNY-SBAR-HTS20', 'Loa Thanh Soundbar Sony HT-S20R 5.1 Kênh Vòm Rạp Chiếu Phim', 'Công suất thực 400W uy lực, âm thanh vòm 5.1 chân thực với loa sau và subwoofer rời cho trải nghiệm phim ảnh đỉnh cao.', 199.00, 249.00, 35, 280, 4.85, 56, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800'),
(87, 4, 12, 21, 'KCH-K2P-RGB', 'Bàn Phím Cơ Không Dây Keychron K2 Pro QMK/VIA Switch Gateron G Pro', 'Layout 75% gọn gàng, hỗ trợ tùy biến phím QMK/VIA, kết nối Bluetooth 5.1 cùng lúc 3 thiết bị và đèn nền RGB rực rỡ.', 95.00, 115.00, 60, 310, 4.90, 68, 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800'),
(88, 4, 13, 9, 'DJI-OM6-PLT', 'Gimbal Chống Rung DJI Osmo Mobile 6 Theo Dõi ActiveTrack 6.0', 'Khả năng chống rung 3 trục siêu mượt, thanh nối dài tích hợp 215mm cho góc selfie rộng và ngàm kẹp từ tính tháo lắp nhanh.', 139.00, 159.00, 40, 220, 4.86, 45, 'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?auto=format&fit=crop&q=80&w=800'),
(89, 4, 14, 23, 'MSH-MJ4-BLK', 'Tai Nghe Chụp Tai Không Dây Marshall Major IV Bluetooth Pin 80h', 'Thiết kế vintage bọc da cổ điển, chất âm Marshall bùng nổ đặc trưng, sạc không dây tiện lợi và pin nghe nhạc hơn 80 giờ.', 129.00, 149.00, 50, 360, 4.92, 78, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'),
(90, 4, 15, 3, 'MS-XBX-CTRL', 'Tay Cầm Chơi Game Không Dây Microsoft Xbox Wireless Controller Carbon', 'Kết nối nhanh PC, Xbox, iOS, Android qua Bluetooth, vân nhám bám tay chống trượt và nút D-pad hybrid chính xác.', 59.00, 69.00, 75, 410, 4.87, 82, 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&q=80&w=800'),
(91, 2, 16, 33, 'CNF-BLAZ-REG', 'Áo Khoác Blazer Nam Công Sở Canifa Dáng Regular Fit Trẻ Trung', 'Chất vải thun dệt cao cấp đứng phom, co giãn nhẹ nhàng mang lại cảm giác thoải mái khi ngồi làm việc cả ngày.', 49.00, 65.00, 65, 290, 4.82, 51, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800'),
(92, 2, 17, 34, 'UNQ-SWEAT-TURT', 'Áo Len Nữ Cổ Lọ Dệt Kim Mềm Mịn Uniqlo Giữ Nhiệt Mùa Đông', 'Công nghệ sợi len siêu mềm không gây ngứa cổ, giữ ấm cơ thể nhẹ nhàng và dễ phối cùng áo khoác dáng dài.', 35.00, 45.00, 80, 340, 4.89, 64, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800'),
(93, 2, 18, 4, 'CLK-OXF-LTHR', 'Giày Tây Nam Da Bò Thật Oxford Buộc Dây Công Sở Sang Trọng', 'Chất da bò nhập khẩu sáng bóng, lót đệm êm chân chống sốc và đường khâu đế thủ công tỉ mỉ độ bền trên 3 năm.', 75.00, 99.00, 55, 260, 4.88, 49, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=800'),
(94, 2, 19, 18, 'CK-FLAT-RND', 'Giày Búp Bê Nữ Mũi Tròn Da Cừu Êm Chân Charles & Keith', 'Đế cao su dẻo uốn cong linh hoạt, quai nơ đính kim loại thanh tao, bảo vệ gót chân khi đi bộ nhiều.', 45.00, 59.00, 70, 380, 4.86, 67, 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=800'),
(95, 2, 20, 18, 'CK-CLUTCH-GLD', 'Ví Cầm Tay Nữ Da Thật Mini Clutch Sang Trọng Khóa Mạ Vàng', 'Nhiều ngăn đựng thẻ ngân hàng, tiền mặt và son môi nhỏ gọn, kèm dây xích đeo vai tinh xảo cho dạ tiệc.', 39.00, 49.00, 85, 420, 4.90, 73, 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800'),
(96, 7, 21, 10, 'CSO-SHN-SAP', 'Đồng Hồ Nữ Dây Kim Loại Casio Sheen Kính Sapphire Chống Trầy', 'Mặt kính Sapphire cao cấp chống trầy xước hoàn hảo, đính đá Swarovski lấp lánh và chuẩn chống nước 50m.', 89.00, 110.00, 50, 310, 4.93, 58, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800'),
(97, 6, 22, 35, 'MI-LAMP-RGB', 'Đèn Ngủ Để Bàn Thông Minh Cảm Ứng Đổi 16 Triệu Màu Xiaomi Mijia', 'Điều khiển bằng giọng nói và điện thoại, tùy chỉnh độ sáng mượt mà bảo vệ mắt khi đọc sách và tạo không gian thư giãn.', 29.00, 39.00, 95, 520, 4.87, 94, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800'),
(98, 6, 23, 35, 'LCK-AF55-DIG', 'Nồi Chiên Không Dầu Điện Tử Lock&Lock 5.5L Nướng Đối Lưu 360', 'Giảm 80% dầu mỡ trong món ăn, 8 chương trình nấu cài đặt sẵn với màn hình cảm ứng LED hiện đại dễ lau chùi.', 79.00, 109.00, 45, 270, 4.91, 62, 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800'),
(99, 8, 24, 30, 'PET-TREE-SISAL', 'Trụ Cào Móng Cho Mèo Đa Tầng Bọc Dây Thừng Tự Nhiên Kèm Võng', 'Chất liệu gỗ MDF bọc dây thừng gai tự nhiên bền chắc, giúp mèo giải tỏa stress và hạn chế cào xước đồ nội thất.', 25.00, 35.00, 65, 380, 4.84, 57, 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&q=80&w=800'),
(100, 5, 25, 13, 'MB-MATTE-INK', 'Son Kem Lì Maybelline SuperStay Matte Ink Chuẩn Màu Lâu Trôi 16h', 'Khả năng giữ màu chuẩn sắc suốt 16 tiếng không lem trôi khi ăn uống, bảng màu thời thượng tôn mọi sắc tố da.', 12.00, 16.00, 150, 850, 4.94, 145, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800'),
(101, 5, 26, 27, 'HLT-OMG3-200', 'Viên Uống Dầu Cá Tinh Khiết Omega 3 Bổ Mắt & Tim Mạch Hộp 200 Viên', 'Chiết xuất từ cá biển sâu tự nhiên giàu EPA & DHA hỗ trợ sáng mắt, giảm mỏi mắt khi dùng máy tính và bảo vệ tim mạch.', 22.00, 29.00, 90, 490, 4.90, 88, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800'),
(102, 6, 27, 15, 'STR-TRVL-ALU', 'Xe Đẩy Gấp Gọn Du Lịch Siêu Nhẹ Khung Nhôm Cho Bé 0-3 Tuổi', 'Khung nhôm hàng không siêu nhẹ chỉ 4.5kg, gấp gọn bằng một nút bấm có thể xách tay lên khoang máy bay tiện lợi.', 59.00, 79.00, 40, 230, 4.88, 46, 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=800'),
(103, 8, 28, 8, 'YGA-MAT-TPE8', 'Thảm Tập Yoga Chống Trượt Định Tuyến TPE 2 Lớp Dày 8mm Êm Chân', 'Vạch kẻ định tuyến chuẩn giúp vào tư thế chính xác, chất liệu TPE thân thiện môi trường, chống trơn trượt mồ hôi tối đa.', 19.00, 26.00, 110, 620, 4.85, 98, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&q=80&w=800'),
(104, 8, 29, 24, '70M-DASH-A500', 'Camera Hành Trình Ô Tô 70mai A500S Ghi Hình 2K Siêu Nét Ban Đêm', 'Cảm biến Sony Starvis hỗ trợ GPS và ADAS cảnh báo lệch làn, tự động khóa video khi xảy ra va chạm khẩn cấp.', 69.00, 89.00, 55, 310, 4.91, 59, 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800'),
(105, 8, 30, 28, 'FHS-PSY-MONEY', 'Sách Tâm Lý Học Về Tiền - Kiệt Tác Tài Chính Cá Nhân Bìa Cứng', '19 câu chuyện ngắn hé lộ cách tư duy kỳ lạ của con người về tiền bạc, giúp xây dựng thói quen tài chính bền vững.', 9.00, 12.00, 200, 1200, 4.96, 230, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'),
(106, 7, 31, 26, 'CD-COF-ARA500', 'Cà Phê Hạt Rang Mộc Arabica Cầu Đất Thơm Đượm Vị Gói 500g', '100% hạt Arabica Cầu Đất tuyển chọn độ cao 1600m, rang mộc độ vừa (medium roast) hương hoa quả và hậu vị ngọt sâu.', 8.00, 11.00, 180, 750, 4.92, 115, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800'),
(107, 8, 32, 31, 'LGO-ARC-LDN468', 'Bộ Xếp Hình LEGO Architecture London Cầu Tháp Luân Đôn 468 Chi Tiết', 'Tái hiện đường chân trời London với biểu tượng Tháp Big Ben, Mắt Luân Đôn và Cầu Tháp lịch sử tinh xảo để bàn làm việc.', 45.00, 55.00, 60, 340, 4.95, 74, 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&q=80&w=800'),
(108, 1, 33, 32, 'VOU-CGV-2D', 'E-Voucher Vé Xem Phim CGV 2D Toàn Quốc Hạn Dùng 6 Tháng', 'Áp dụng cho mọi rạp CGV trên toàn quốc từ Thứ 2 đến Chủ Nhật, nhận mã vé điện tử tức thì qua SMS hoặc App.', 5.00, 7.00, 400, 2800, 4.90, 320, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800');

SELECT setval('products_id_seq', 108);

-- ------------------------------------------------------------------------------
-- 7. SEED ORDERS & ORDERDETAILS (Đa gian hàng, mô phỏng doanh thu theo từng tháng)
-- ------------------------------------------------------------------------------
INSERT INTO Orders (id, user_id, total_amount, shipping_address, payment_method, status, created_at) VALUES
-- Đơn hàng tháng 8 (Thử nghiệm tính tăng trưởng tháng bằng Window Function LAG/LEAD)
(1, 10, 1448.00, 'Tòa nhà Landmark 81, P.22, Q. Bình Thạnh, TP.HCM', 'credit_card', 'completed', '2026-08-15 10:30:00'),
(2, 11, 230.00, 'Số 280 An Dương Vương, P.4, Q.5, TP.HCM', 'cod', 'completed', '2026-08-25 14:20:00'),

-- Đơn hàng tháng 9
(3, 10, 548.00, 'Tòa nhà Landmark 81, P.22, Q. Bình Thạnh, TP.HCM', 'banking', 'completed', '2026-09-10 09:15:00'),
(4, 11, 1299.00, 'Số 280 An Dương Vương, P.4, Q.5, TP.HCM', 'credit_card', 'completed', '2026-09-28 16:45:00'),

-- Đơn hàng tháng 10
(5, 10, 848.00, 'Tòa nhà Landmark 81, P.22, Q. Bình Thạnh, TP.HCM', 'banking', 'completed', '2026-10-12 11:00:00'),
(6, 11, 499.00, 'Số 280 An Dương Vương, P.4, Q.5, TP.HCM', 'credit_card', 'completed', '2026-10-24 15:30:00'),

-- Đơn hàng tháng 11 (Hiện tại)
(7, 10, 398.00, 'Tòa nhà Landmark 81, P.22, Q. Bình Thạnh, TP.HCM', 'credit_card', 'completed', '2026-11-02 08:30:00'),
(8, 11, 178.00, 'Số 280 An Dương Vương, P.4, Q.5, TP.HCM', 'cod', 'completed', '2026-11-04 14:15:00');

SELECT setval('orders_id_seq', 8);

INSERT INTO OrderDetails (id, order_id, product_id, shop_id, quantity, price_at_purchase) VALUES
-- Đơn 1
(1, 1, 1, 1, 1, 1199.00),
(2, 1, 15, 1, 1, 249.00),
-- Đơn 2
(3, 2, 30, 2, 2, 115.00),
-- Đơn 3
(4, 3, 20, 4, 1, 349.00),
(5, 3, 22, 4, 1, 199.00),
-- Đơn 4
(6, 4, 2, 3, 1, 1299.00),
-- Đơn 5
(7, 5, 19, 4, 1, 499.00),
(8, 5, 20, 4, 1, 349.00),
-- Đơn 6
(9, 6, 19, 4, 1, 499.00),
-- Đơn 7
(10, 7, 16, 4, 1, 398.00),
-- Đơn 8
(11, 8, 30, 2, 1, 115.00),
(12, 8, 26, 2, 1, 63.00);

SELECT setval('orderdetails_id_seq', 12);

-- ------------------------------------------------------------------------------
-- 8. SEED REVIEWS (Đánh giá người dùng thực tế)
-- ------------------------------------------------------------------------------
INSERT INTO Reviews (id, product_id, user_id, order_id, rating, comment) VALUES
(1, 1, 10, 1, 5, 'Màu Titan tự nhiên cầm rất nhẹ và mát tay, camera zoom 5x chụp concert cực kỳ rõ nét!'),
(2, 15, 10, 1, 5, 'Chống ồn của AirPods Pro 2 đi ngoài đường xe cộ ồn ào bật lên là êm ru, rất đáng tiền.'),
(3, 30, 11, 2, 5, 'Giày Air Force 1 chính hãng Nike đi chuẩn form, da êm, dễ phối mọi loại outfit đi học đi làm.'),
(4, 20, 10, 3, 5, 'Màn hình OLED của Nintendo Switch chơi Zelda ngoài trời sáng đẹp rực rỡ, giao hàng nhanh 2h.'),
(5, 2, 11, 4, 5, 'Galaxy S24 Ultra chụp đêm đỉnh chóp, tính năng khoanh tròn tìm kiếm bằng AI siêu tiện lợi!'),
(6, 19, 11, 6, 5, 'PS5 Slim thiết kế gọn gàng hơn bản cũ nhiều, ổ cứng 1TB tha hồ cài game AAA nặng.'),
(7, 52, 11, 8, 5, 'Serum L''Oreal Glycolic dùng 2 tuần da mờ thâm mụn rõ rệt, chất serum mỏng nhẹ thấm nhanh.');

SELECT setval('reviews_id_seq', 7);

-- ------------------------------------------------------------------------------
-- 9. SEED USERINTERACTIONS (Dữ liệu mẫu lịch sử hành vi phục vụ AI Recommendation)
-- ------------------------------------------------------------------------------
INSERT INTO UserInteractions (id, user_id, product_id, category_id, interaction_type, weight, created_at) VALUES
-- User 10: Người đam mê đồ công nghệ (Smartphones, Laptops, Audio, Gaming)
(1, 10, 1, 10, 'view', 1.0, NOW() - INTERVAL '3 days'),
(2, 10, 2, 10, 'view', 1.0, NOW() - INTERVAL '2 days'),
(3, 10, 8, 12, 'cart', 3.0, NOW() - INTERVAL '2 days'),
(4, 10, 15, 14, 'purchase', 5.0, NOW() - INTERVAL '1 day'),
(5, 10, 19, 15, 'view', 1.0, NOW() - INTERVAL '12 hours'),
(6, 10, 85, 10, 'view', 1.0, NOW() - INTERVAL '2 hours'),
-- User 11: Người đam mê thời trang, làm đẹp (Women's Fashion, Bags, Beauty)
(7, 11, 27, 17, 'view', 1.0, NOW() - INTERVAL '3 days'),
(8, 11, 29, 17, 'cart', 3.0, NOW() - INTERVAL '2 days'),
(9, 11, 36, 20, 'view', 1.0, NOW() - INTERVAL '1 day'),
(10, 11, 52, 25, 'purchase', 5.0, NOW() - INTERVAL '1 day'),
(11, 11, 92, 17, 'view', 1.0, NOW() - INTERVAL '5 hours'),
(12, 11, 100, 25, 'cart', 3.0, NOW() - INTERVAL '1 hour');

SELECT setval('userinteractions_id_seq', 12);
