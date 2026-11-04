-- ==============================================================================
-- SHOPLITE AI - ADVANCED E-COMMERCE DATABASE SCHEMA (SHOPEE MULTI-VENDOR MODEL)
-- Designed adhering strictly to 3NF/BCNF, Advanced Relational & T-SQL Concepts
-- ==============================================================================

-- Drop existing objects in reverse dependency order
DROP VIEW IF EXISTS vw_top_selling_per_category CASCADE;
DROP VIEW IF EXISTS vw_shop_sales_performance CASCADE;
DROP VIEW IF EXISTS vw_product_catalog_details CASCADE;
DROP FUNCTION IF EXISTS fn_get_category_path(INT) CASCADE;
DROP PROCEDURE IF EXISTS sp_checkout(INT, INT[], INT[], TEXT, INT) CASCADE;
DROP TRIGGER IF EXISTS trg_review_sync ON Reviews CASCADE;
DROP FUNCTION IF EXISTS fn_trg_sync_product_reviews() CASCADE;
DROP TRIGGER IF EXISTS trg_order_detail_stock ON OrderDetails CASCADE;
DROP FUNCTION IF EXISTS fn_trg_order_detail_stock() CASCADE;

DROP TABLE IF EXISTS InventoryLogs CASCADE;
DROP TABLE IF EXISTS Reviews CASCADE;
DROP TABLE IF EXISTS OrderDetails CASCADE;
DROP TABLE IF EXISTS Orders CASCADE;
DROP TABLE IF EXISTS Products CASCADE;
DROP TABLE IF EXISTS Category_Brands CASCADE;
DROP TABLE IF EXISTS Brands CASCADE;
DROP TABLE IF EXISTS Categories CASCADE;
DROP TABLE IF EXISTS Shops CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE (Hỗ trợ 3 nhóm người dùng: customer, seller, admin)
-- ------------------------------------------------------------------------------
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON Users(phone);

-- ------------------------------------------------------------------------------
-- 2. SHOPS TABLE (Gian hàng Shopee - Liên kết 1-1 với User có quyền Seller)
-- ------------------------------------------------------------------------------
CREATE TABLE Shops (
    id SERIAL PRIMARY KEY,
    owner_id INT UNIQUE NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(160) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating BETWEEN 1.00 AND 5.00),
    is_official BOOLEAN DEFAULT FALSE, -- Shopee Mall badge
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. CATEGORIES TABLE (Cấu trúc phân cấp đa tầng hỗ trợ Recursive CTE)
-- ------------------------------------------------------------------------------
CREATE TABLE Categories (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES Categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    icon_name VARCHAR(50) DEFAULT 'Box',
    description TEXT
);

-- ------------------------------------------------------------------------------
-- 4. BRANDS TABLE (Thương hiệu chuẩn hóa 3NF/BCNF)
-- ------------------------------------------------------------------------------
CREATE TABLE Brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    logo_url TEXT,
    origin_country VARCHAR(100),
    description TEXT
);

-- ------------------------------------------------------------------------------
-- 5. CATEGORY_BRANDS TABLE (Bảng trung gian N-N: Thương hiệu theo Danh mục)
-- ------------------------------------------------------------------------------
CREATE TABLE Category_Brands (
    category_id INT NOT NULL REFERENCES Categories(id) ON DELETE CASCADE,
    brand_id INT NOT NULL REFERENCES Brands(id) ON DELETE CASCADE,
    PRIMARY KEY (category_id, brand_id)
);

-- ------------------------------------------------------------------------------
-- 6. PRODUCTS TABLE (Sản phẩm đa người bán chuẩn Shopee)
-- ------------------------------------------------------------------------------
CREATE TABLE Products (
    id SERIAL PRIMARY KEY,
    shop_id INT NOT NULL REFERENCES Shops(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES Categories(id) ON DELETE RESTRICT,
    brand_id INT REFERENCES Brands(id) ON DELETE SET NULL,
    sku VARCHAR(64) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(12, 2) CHECK (original_price >= price),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sold_count INT NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
    rating_avg NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating_avg BETWEEN 1.00 AND 5.00),
    review_count INT DEFAULT 0 CHECK (review_count >= 0),
    image_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chỉ mục tối ưu hóa truy vấn tìm kiếm, lọc danh mục & thương hiệu
CREATE INDEX idx_products_shop_id ON Products (shop_id);
CREATE INDEX idx_products_category_id ON Products (category_id);
CREATE INDEX idx_products_brand_id ON Products (brand_id);
CREATE INDEX idx_products_price_sold ON Products (category_id, price, sold_count DESC);

-- ------------------------------------------------------------------------------
-- 7. ORDERS TABLE (Đơn hàng mua sắm)
-- ------------------------------------------------------------------------------
CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES Users(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cod' CHECK (payment_method IN ('cod', 'credit_card', 'banking')),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON Orders (user_id);

-- ------------------------------------------------------------------------------
-- 8. ORDERDETAILS TABLE (Chi tiết đơn hàng - Thực thể yếu phụ thuộc Orders)
-- ------------------------------------------------------------------------------
CREATE TABLE OrderDetails (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES Orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES Products(id) ON DELETE RESTRICT,
    shop_id INT NOT NULL REFERENCES Shops(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_purchase NUMERIC(12, 2) NOT NULL CHECK (price_at_purchase >= 0),
    CONSTRAINT uq_order_product UNIQUE (order_id, product_id)
);

CREATE INDEX idx_orderdetails_order_id ON OrderDetails (order_id);
CREATE INDEX idx_orderdetails_shop_id ON OrderDetails (shop_id);

-- ------------------------------------------------------------------------------
-- 9. REVIEWS TABLE (Đánh giá & Xếp hạng sản phẩm)
-- ------------------------------------------------------------------------------
CREATE TABLE Reviews (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    order_id INT REFERENCES Orders(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_product_review UNIQUE (user_id, product_id)
);

CREATE INDEX idx_reviews_product_id ON Reviews (product_id);

-- ------------------------------------------------------------------------------
-- 10. INVENTORYLOGS TABLE (Nhật ký biến động kho - Audit Logging)
-- ------------------------------------------------------------------------------
CREATE TABLE InventoryLogs (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    change_amount INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- LẬP TRÌNH CSDL (TRIGGERS, FUNCTIONS, PROCEDURES & ADVANCED VIEWS)
-- ==============================================================================

-- 1. TRIGGER: Tự động trừ tồn kho, tăng lượt bán và ghi nhật ký kho khi phát sinh OrderDetail
CREATE OR REPLACE FUNCTION fn_trg_order_detail_stock()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    -- Trừ tồn kho & cộng số lượng đã bán
    UPDATE Products 
    SET stock = stock - NEW.quantity,
        sold_count = sold_count + NEW.quantity
    WHERE id = NEW.product_id;

    -- Ghi nhật ký biến động kho (Audit trail)
    INSERT INTO InventoryLogs (product_id, change_amount, reason)
    VALUES (NEW.product_id, -NEW.quantity, 'Order #' || NEW.order_id || ' purchased item (Qty: ' || NEW.quantity || ')');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_detail_stock
AFTER INSERT ON OrderDetails
FOR EACH ROW
EXECUTE FUNCTION fn_trg_order_detail_stock();


-- 2. TRIGGER: Tự động đồng bộ điểm trung bình rating và tổng số đánh giá của sản phẩm
CREATE OR REPLACE FUNCTION fn_trg_sync_product_reviews()
RETURNS TRIGGER
SET search_path = public
AS $$
DECLARE
    v_product_id INT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_product_id := OLD.product_id;
    ELSE
        v_product_id := NEW.product_id;
    END IF;

    UPDATE Products
    SET 
        rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM Reviews WHERE product_id = v_product_id), 5.00),
        review_count = (SELECT COUNT(*) FROM Reviews WHERE product_id = v_product_id)
    WHERE id = v_product_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_sync
AFTER INSERT OR UPDATE OR DELETE ON Reviews
FOR EACH ROW
EXECUTE FUNCTION fn_trg_sync_product_reviews();


-- 3. STORED PROCEDURE: Giao dịch đặt hàng an toàn ACID & Khóa dòng chống Overselling
CREATE OR REPLACE PROCEDURE sp_checkout(
    p_user_id INT,
    p_product_ids INT[],
    p_quantities INT[],
    p_shipping_address TEXT,
    OUT p_order_id INT
)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_total_amount NUMERIC(12, 2) := 0;
    v_price NUMERIC(12, 2);
    v_stock INT;
    v_shop_id INT;
    i INT;
BEGIN
    -- 1. Tạo đơn hàng mới
    INSERT INTO Orders (user_id, total_amount, shipping_address, status) 
    VALUES (p_user_id, 0.00, p_shipping_address, 'completed') 
    RETURNING id INTO p_order_id;

    -- 2. Duyệt từng sản phẩm trong giỏ hàng
    FOR i IN 1 .. array_length(p_product_ids, 1) LOOP
        -- PESSIMISTIC LOCKING: Khóa độc quyền cấp dòng (FOR UPDATE) chống bán vượt tồn kho (Overselling)
        SELECT price, stock, shop_id INTO v_price, v_stock, v_shop_id
        FROM Products 
        WHERE id = p_product_ids[i] 
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product ID % does not exist in catalog', p_product_ids[i];
        END IF;

        IF v_stock < p_quantities[i] THEN
            RAISE EXCEPTION 'Product ID % is out of stock (Available: %, Requested: %)', 
                p_product_ids[i], v_stock, p_quantities[i];
        END IF;

        -- Thêm chi tiết đơn hàng (Trigger trg_order_detail_stock sẽ tự trừ stock & ghi log)
        INSERT INTO OrderDetails (order_id, product_id, shop_id, quantity, price_at_purchase)
        VALUES (p_order_id, p_product_ids[i], v_shop_id, p_quantities[i], v_price);

        -- Cộng dồn giá trị đơn
        v_total_amount := v_total_amount + (v_price * p_quantities[i]);
    END LOOP;

    -- 3. Cập nhật tổng giá trị chính xác cho đơn hàng
    UPDATE Orders SET total_amount = v_total_amount WHERE id = p_order_id;
END;
$$;


-- 4. FUNCTION: Recursive CTE duyệt cây phân cấp danh mục (Breadcrumb)
CREATE OR REPLACE FUNCTION fn_get_category_path(p_category_id INT)
RETURNS TABLE (
    category_id INT,
    full_path TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE CategoryHierarchy AS (
        -- Anchor member: Danh mục hiện tại
        SELECT id, parent_id, name::TEXT AS breadcrumb
        FROM Categories
        WHERE id = p_category_id

        UNION ALL

        -- Recursive member: Truy ngược lên danh mục cha
        SELECT c.id, c.parent_id, (c.name || ' > ' || ch.breadcrumb)::TEXT
        FROM Categories c
        INNER JOIN CategoryHierarchy ch ON c.id = ch.parent_id
    )
    SELECT ch.id, ch.breadcrumb
    FROM CategoryHierarchy ch
    WHERE ch.parent_id IS NULL;
END;
$$;


-- 5. ADVANCED VIEW: Catalog chi tiết tích hợp Shop, Brand, Category & Tính % Khuyến mãi
CREATE OR REPLACE VIEW vw_product_catalog_details WITH (security_invoker = true) AS
SELECT 
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    p.description,
    p.price,
    p.original_price,
    ROUND(((p.original_price - p.price) / p.original_price * 100), 0) AS discount_percent,
    p.stock,
    p.sold_count,
    p.rating_avg,
    p.review_count,
    p.image_url,
    p.status,
    p.created_at,
    -- Shop Info
    s.id AS shop_id,
    s.name AS shop_name,
    s.slug AS shop_slug,
    s.is_official AS shop_is_official,
    s.rating AS shop_rating,
    -- Category Info
    c.id AS category_id,
    c.name AS category_name,
    c.slug AS category_slug,
    -- Brand Info
    b.id AS brand_id,
    b.name AS brand_name,
    b.slug AS brand_slug,
    b.logo_url AS brand_logo
FROM Products p
INNER JOIN Shops s ON p.shop_id = s.id
INNER JOIN Categories c ON p.category_id = c.id
LEFT JOIN Brands b ON p.brand_id = b.id;


-- 6. ADVANCED VIEW: Báo cáo hiệu năng kinh doanh của từng Shop (Window Functions)
CREATE OR REPLACE VIEW vw_shop_sales_performance WITH (security_invoker = true) AS
SELECT 
    s.id AS shop_id,
    s.name AS shop_name,
    s.is_official,
    COUNT(DISTINCT od.order_id) AS total_orders,
    COALESCE(SUM(od.quantity), 0) AS total_units_sold,
    COALESCE(SUM(od.quantity * od.price_at_purchase), 0) AS total_revenue,
    -- WINDOW FUNCTION: Xếp hạng doanh thu giữa các Shop trên toàn sàn
    DENSE_RANK() OVER (ORDER BY COALESCE(SUM(od.quantity * od.price_at_purchase), 0) DESC) AS revenue_rank
FROM Shops s
LEFT JOIN OrderDetails od ON s.id = od.shop_id
GROUP BY s.id, s.name, s.is_official;


-- 7. ADVANCED VIEW: Top sản phẩm bán chạy nhất theo từng Danh mục (Window Function Partition)
CREATE OR REPLACE VIEW vw_top_selling_per_category WITH (security_invoker = true) AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.price,
    p.sold_count,
    c.id AS category_id,
    c.name AS category_name,
    s.name AS shop_name,
    -- WINDOW FUNCTION: Xếp hạng bán chạy trong từng danh mục riêng biệt
    DENSE_RANK() OVER (PARTITION BY p.category_id ORDER BY p.sold_count DESC) AS rank_in_category
FROM Products p
INNER JOIN Categories c ON p.category_id = c.id
INNER JOIN Shops s ON p.shop_id = s.id
WHERE p.status = 'active';
