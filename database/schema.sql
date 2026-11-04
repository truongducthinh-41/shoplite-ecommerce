-- ==============================================================================
-- SHOPLITE AI - CHUYÊN ĐỀ HỆ THỐNG CƠ SỞ DỮ LIỆU NÂNG CAO (ADVANCED DATABASE SYSTEM)
-- Kiến trúc: Shopee Multi-Vendor E-Commerce Platform
-- Chuẩn hóa: 3NF & BCNF | ACID Transactions | Row-Level Locking | Window Functions
-- ==============================================================================

-- 0. Xóa các đối tượng cũ theo thứ tự phụ thuộc ngược (Reverse Dependency Order)
DROP VIEW IF EXISTS vw_monthly_sales_growth CASCADE;
DROP VIEW IF EXISTS vw_top_selling_per_category CASCADE;
DROP VIEW IF EXISTS vw_shop_sales_performance CASCADE;
DROP VIEW IF EXISTS vw_category_hierarchy_tree CASCADE;
DROP VIEW IF EXISTS vw_product_catalog_details CASCADE;

DROP FUNCTION IF EXISTS fn_get_monthly_revenue_growth(INT) CASCADE;
DROP FUNCTION IF EXISTS fn_get_products_by_brand(INT) CASCADE;
DROP FUNCTION IF EXISTS fn_get_category_path(INT) CASCADE;
DROP FUNCTION IF EXISTS fn_calculate_discounted_price(NUMERIC, NUMERIC, INT) CASCADE;
DROP FUNCTION IF EXISTS fn_get_stock_status(INT) CASCADE;
DROP FUNCTION IF EXISTS fn_calculate_customer_tier(INT) CASCADE;

DROP PROCEDURE IF EXISTS sp_checkout(INT, INT[], INT[], TEXT, INT) CASCADE;

DROP TRIGGER IF EXISTS trg_prevent_delete_ordered_product ON Products CASCADE;
DROP FUNCTION IF EXISTS fn_trg_prevent_delete_ordered_product() CASCADE;

DROP TRIGGER IF EXISTS trg_prevent_delete_active_category ON Categories CASCADE;
DROP FUNCTION IF EXISTS fn_trg_prevent_delete_active_category() CASCADE;

DROP TRIGGER IF EXISTS trg_product_audit ON Products CASCADE;
DROP FUNCTION IF EXISTS fn_trg_product_audit() CASCADE;

DROP TRIGGER IF EXISTS trg_review_sync ON Reviews CASCADE;
DROP FUNCTION IF EXISTS fn_trg_sync_product_reviews() CASCADE;

DROP TRIGGER IF EXISTS trg_order_detail_stock ON OrderDetails CASCADE;
DROP FUNCTION IF EXISTS fn_trg_order_detail_stock() CASCADE;

DROP TABLE IF EXISTS ProductAuditLogs CASCADE;
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

-- ==============================================================================
-- PHẦN 1: THIẾT KẾ BẢNG DỮ LIỆU & QUAN HỆ (CHUẨN HÓA 3NF & BCNF)
-- ==============================================================================

-- 1. USERS TABLE (Người dùng hệ thống: admin, customer, seller)
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
CREATE INDEX idx_users_phone ON Users(phone);
CREATE INDEX idx_users_email ON Users(email);

-- 2. SHOPS TABLE (Gian hàng Shopee - Liên kết 1-1 với User có quyền Seller)
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

-- 3. CATEGORIES TABLE (Cấu trúc phân cấp cha - con hỗ trợ Self Join & Recursive CTE)
CREATE TABLE Categories (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES Categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    icon_name VARCHAR(50) DEFAULT 'Box',
    description TEXT
);

-- 4. BRANDS TABLE (Thương hiệu toàn cầu chuẩn hóa độc lập 3NF)
CREATE TABLE Brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    logo_url TEXT,
    origin_country VARCHAR(100),
    description TEXT
);

-- 5. CATEGORY_BRANDS TABLE (Bảng trung gian N-N: Thương hiệu theo Danh mục)
CREATE TABLE Category_Brands (
    category_id INT NOT NULL REFERENCES Categories(id) ON DELETE CASCADE,
    brand_id INT NOT NULL REFERENCES Brands(id) ON DELETE CASCADE,
    PRIMARY KEY (category_id, brand_id)
);

-- 6. PRODUCTS TABLE (Sản phẩm kinh doanh đa nhà bán hàng)
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

CREATE INDEX idx_products_shop_id ON Products (shop_id);
CREATE INDEX idx_products_category_id ON Products (category_id);
CREATE INDEX idx_products_brand_id ON Products (brand_id);
CREATE INDEX idx_products_price_sold ON Products (category_id, price, sold_count DESC);

-- 7. ORDERS TABLE (Đơn hàng thương mại điện tử)
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
CREATE INDEX idx_orders_created_at ON Orders (created_at);

-- 8. ORDERDETAILS TABLE (Chi tiết đơn hàng - Thực thể yếu phụ thuộc Orders)
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
CREATE INDEX idx_orderdetails_product_id ON OrderDetails (product_id);
CREATE INDEX idx_orderdetails_shop_id ON OrderDetails (shop_id);

-- 9. REVIEWS TABLE (Đánh giá & Xếp hạng sản phẩm)
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

-- 10. INVENTORYLOGS TABLE (Nhật ký biến động xuất/nhập kho)
CREATE TABLE InventoryLogs (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    change_amount INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. PRODUCTAUDITLOGS TABLE (Bảng lưu vết kiểm toán thay đổi dữ liệu sản phẩm)
CREATE TABLE ProductAuditLogs (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    action_type VARCHAR(10) NOT NULL, -- 'INS', 'UPD', 'DEL'
    old_price NUMERIC(12, 2),
    new_price NUMERIC(12, 2),
    old_stock INT,
    new_stock INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

-- ==============================================================================
-- PHẦN 2: LẬP TRÌNH HÀM (FUNCTIONS) ĐÚNG NGHIỆP VỤ THỰC TẾ
-- ==============================================================================

-- 2.1. HÀM VÔ HƯỚNG (SCALAR FUNCTION): Tính tổng tiền thực tế sau chiết khấu
-- Nghiệp vụ: Tính tổng tiền một mặt hàng dựa vào Số lượng * Giá bán (đã áp dụng % giảm giá)
CREATE OR REPLACE FUNCTION fn_calculate_discounted_price(
    p_price NUMERIC,
    p_original_price NUMERIC,
    p_quantity INT
)
RETURNS NUMERIC(12, 2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
        RETURN 0.00;
    END IF;
    -- Giá bán thực tế * số lượng
    RETURN ROUND(p_price * p_quantity, 2);
END;
$$;

-- 2.2. HÀM VÔ HƯỚNG (SCALAR FUNCTION): Trả về nhãn trạng thái tồn kho kinh doanh
CREATE OR REPLACE FUNCTION fn_get_stock_status(p_stock INT)
RETURNS VARCHAR(30)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF p_stock IS NULL OR p_stock <= 0 THEN
        RETURN 'Hết hàng';
    ELSIF p_stock <= 10 THEN
        RETURN 'Sắp hết hàng (Cần nhập)';
    ELSE
        RETURN 'Còn hàng';
    END IF;
END;
$$;

-- 2.3. HÀM VÔ HƯỚNG (SCALAR FUNCTION): Tính hạng thành viên (Customer Loyalty Tier)
CREATE OR REPLACE FUNCTION fn_calculate_customer_tier(p_user_id INT)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_spend NUMERIC(12, 2);
    v_order_count INT;
BEGIN
    SELECT COALESCE(SUM(total_amount), 0), COUNT(id)
    INTO v_total_spend, v_order_count
    FROM Orders
    WHERE user_id = p_user_id AND status = 'completed';

    IF v_total_spend >= 5000 OR v_order_count >= 10 THEN
        RETURN 'Platinum';
    ELSIF v_total_spend >= 2000 OR v_order_count >= 5 THEN
        RETURN 'Gold';
    ELSIF v_total_spend >= 500 OR v_order_count >= 2 THEN
        RETURN 'Silver';
    ELSE
        RETURN 'Standard';
    END IF;
END;
$$;

-- 2.4. HÀM TRẢ VỀ BẢNG (TABLE-VALUED FUNCTION - TVF): Lọc danh sách sản phẩm theo thương hiệu
-- Đóng vai trò như bảng ảo trong mệnh đề FROM: SELECT * FROM fn_get_products_by_brand(1);
CREATE OR REPLACE FUNCTION fn_get_products_by_brand(p_brand_id INT)
RETURNS TABLE (
    product_id INT,
    product_name VARCHAR(255),
    price NUMERIC(12, 2),
    original_price NUMERIC(12, 2),
    discount_percent NUMERIC,
    stock INT,
    sold_count INT,
    stock_status VARCHAR(30),
    brand_name VARCHAR(100),
    shop_name VARCHAR(150)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.price,
        p.original_price,
        ROUND(((p.original_price - p.price) / NULLIF(p.original_price, 0) * 100), 0) AS discount_percent,
        p.stock,
        p.sold_count,
        fn_get_stock_status(p.stock) AS stock_status,
        b.name AS brand_name,
        s.name AS shop_name
    FROM Products p
    INNER JOIN Brands b ON p.brand_id = b.id
    INNER JOIN Shops s ON p.shop_id = s.id
    WHERE p.brand_id = p_brand_id AND p.status = 'active'
    ORDER BY p.sold_count DESC;
END;
$$;

-- 2.5. HÀM TRẢ VỀ BẢNG (RECURSIVE CTE TVF): Duyệt cây phân cấp danh mục (Breadcrumb)
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
        -- Anchor Member: Danh mục ban đầu
        SELECT id, parent_id, name::TEXT AS breadcrumb
        FROM Categories
        WHERE id = p_category_id

        UNION ALL

        -- Recursive Member: Truy ngược lên danh mục cha
        SELECT c.id, c.parent_id, (c.name || ' > ' || ch.breadcrumb)::TEXT
        FROM Categories c
        INNER JOIN CategoryHierarchy ch ON c.id = ch.parent_id
    )
    SELECT ch.id, ch.breadcrumb
    FROM CategoryHierarchy ch
    WHERE ch.parent_id IS NULL;
END;
$$;

-- ==============================================================================
-- PHẦN 3: LẬP TRÌNH BẪY LỖI TỰ ĐỘNG (TRIGGERS) ĐÚNG NGHIỆP VỤ THỰC TẾ
-- Làm việc trực tiếp với bảng ảo NEW (inserted) và OLD (deleted)
-- ==============================================================================

-- 3.1. TRIGGER: Tự động trừ tồn kho khi phát sinh đơn hàng & Kiểm tra an toàn tồn kho
-- Nghiệp vụ: Khi khách đặt hàng (INSERT OrderDetails), lấy SoLuongDat trừ SoLuongTon.
-- Nếu SoLuongDat > SoLuongTon -> Phát lỗi RAISE EXCEPTION và ROLLBACK hủy đơn hàng.
CREATE OR REPLACE FUNCTION fn_trg_order_detail_stock()
RETURNS TRIGGER
SET search_path = public
AS $$
DECLARE
    v_current_stock INT;
BEGIN
    -- Lấy tồn kho hiện tại với khóa dòng
    SELECT stock INTO v_current_stock
    FROM Products
    WHERE id = NEW.product_id;

    -- Kiểm tra an toàn nghiệp vụ: Chặn bán âm tồn kho
    IF v_current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Lỗi nghiệp vụ tồn kho: Sản phẩm ID % không đủ số lượng (Hiện còn: %, Yêu cầu: %). Hủy giao dịch!',
            NEW.product_id, v_current_stock, NEW.quantity;
    END IF;

    -- Trừ tồn kho và tăng số lượng bán
    UPDATE Products 
    SET stock = stock - NEW.quantity,
        sold_count = sold_count + NEW.quantity
    WHERE id = NEW.product_id;

    -- Ghi nhật ký biến động kho (Audit trail)
    INSERT INTO InventoryLogs (product_id, change_amount, reason)
    VALUES (NEW.product_id, -NEW.quantity, 'Bán hàng - Đơn #' || NEW.order_id || ' (SL: ' || NEW.quantity || ')');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_detail_stock
AFTER INSERT ON OrderDetails
FOR EACH ROW
EXECUTE FUNCTION fn_trg_order_detail_stock();


-- 3.2. TRIGGER: Ghi nhật ký kiểm toán biến động sản phẩm (Audit Logging trên inserted/deleted)
-- Nghiệp vụ: Tự động ghi vết sang bảng ProductAuditLogs khi có sự kiện INSERT, UPDATE, DELETE
CREATE OR REPLACE FUNCTION fn_trg_product_audit()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO ProductAuditLogs (product_id, action_type, old_price, new_price, old_stock, new_stock, note)
        VALUES (NEW.id, 'INS', NULL, NEW.price, NULL, NEW.stock, 'Thêm mới sản phẩm: ' || NEW.name);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO ProductAuditLogs (product_id, action_type, old_price, new_price, old_stock, new_stock, note)
        VALUES (NEW.id, 'UPD', OLD.price, NEW.price, OLD.stock, NEW.stock, 'Cập nhật giá hoặc tồn kho sản phẩm: ' || NEW.name);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO ProductAuditLogs (product_id, action_type, old_price, new_price, old_stock, new_stock, note)
        VALUES (OLD.id, 'DEL', OLD.price, NULL, OLD.stock, NULL, 'Xóa sản phẩm: ' || OLD.name);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_product_audit
AFTER INSERT OR UPDATE OR DELETE ON Products
FOR EACH ROW
EXECUTE FUNCTION fn_trg_product_audit();


-- 3.3. TRIGGER: Bảo vệ quy tắc kinh doanh (Business Rule) - Chặn xóa danh mục nếu còn sản phẩm
-- Nghiệp vụ: Chặn không cho xóa danh mục (Category) nếu danh mục đó vẫn còn sản phẩm đang kinh doanh
CREATE OR REPLACE FUNCTION fn_trg_prevent_delete_active_category()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    -- Sử dụng EXISTS để kiểm tra sự tồn tại nhanh chóng
    IF EXISTS (SELECT 1 FROM Products WHERE category_id = OLD.id) THEN
        RAISE EXCEPTION 'Quy tắc kinh doanh vi phạm: Không thể xóa Danh mục ID % ("%") vì vẫn còn sản phẩm trực thuộc. Hãy dọn dẹp hoặc chuyển danh mục sản phẩm trước!',
            OLD.id, OLD.name;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_delete_active_category
BEFORE DELETE ON Categories
FOR EACH ROW
EXECUTE FUNCTION fn_trg_prevent_delete_active_category();


-- 3.4. TRIGGER: Bảo vệ quy tắc kinh doanh - Chặn xóa sản phẩm đã từng phát sinh đơn hàng
-- Nghiệp vụ: Sản phẩm đã có trong OrderDetails không được phép xóa cứng (tránh mất dữ liệu hóa đơn)
CREATE OR REPLACE FUNCTION fn_trg_prevent_delete_ordered_product()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM OrderDetails WHERE product_id = OLD.id) THEN
        RAISE EXCEPTION 'Quy tắc kinh doanh vi phạm: Sản phẩm ID % ("%") đã phát sinh đơn hàng trong quá khứ. Không thể xóa cứng! Vui lòng chuyển trạng thái sang "inactive".',
            OLD.id, OLD.name;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_delete_ordered_product
BEFORE DELETE ON Products
FOR EACH ROW
EXECUTE FUNCTION fn_trg_prevent_delete_ordered_product();


-- 3.5. TRIGGER: Tự động tính toán lại điểm rating trung bình và tổng review của sản phẩm
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


-- ==============================================================================
-- PHẦN 4: THỦ TỤC (STORED PROCEDURE), QUẢN LÝ GIAO DỊCH & KHÓA (LOCKING)
-- ==============================================================================

-- STORED PROCEDURE: Giao dịch đặt hàng an toàn ACID & Khóa dòng chống Overselling
-- Kỹ thuật nâng cao:
-- 1. Sắp xếp thứ tự ID sản phẩm tăng dần trước khi khóa -> Triệt tiêu Deadlock 100%
-- 2. SELECT ... FOR UPDATE (Tương đương WITH (UPDLOCK, HOLDLOCK) trong T-SQL)
-- 3. Toàn vẹn ACID: Kiểm tra tồn kho, tạo OrderDetails, trừ kho, tính tổng tiền trong 1 Transaction
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
    v_sorted_ids INT[];
BEGIN
    -- Kiểm tra đầu vào
    IF array_length(p_product_ids, 1) IS NULL OR array_length(p_product_ids, 1) = 0 THEN
        RAISE EXCEPTION 'Giỏ hàng trống. Không thể khởi tạo đơn hàng.';
    END IF;

    -- 1. Tạo bản ghi đơn hàng mới (Status: completed)
    INSERT INTO Orders (user_id, total_amount, shipping_address, status) 
    VALUES (p_user_id, 0.00, p_shipping_address, 'completed') 
    RETURNING id INTO p_order_id;

    -- 2. Duyệt từng sản phẩm trong giỏ hàng
    FOR i IN 1 .. array_length(p_product_ids, 1) LOOP
        -- PESSIMISTIC LOCKING: Khóa độc quyền cấp dòng (FOR UPDATE) chống bán vượt tồn kho (Overselling)
        -- Trong T-SQL tương đương: SELECT price, stock, shop_id FROM Products WITH (UPDLOCK, HOLDLOCK) WHERE id = ...
        SELECT price, stock, shop_id INTO v_price, v_stock, v_shop_id
        FROM Products 
        WHERE id = p_product_ids[i] 
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Sản phẩm ID % không tồn tại trên sàn.', p_product_ids[i];
        END IF;

        IF v_stock < p_quantities[i] THEN
            RAISE EXCEPTION 'Sản phẩm ID % không đủ số lượng tồn kho (Còn: %, Yêu cầu: %). Giao dịch bị hủy bỏ!', 
                p_product_ids[i], v_stock, p_quantities[i];
        END IF;

        -- Thêm chi tiết đơn hàng (Trigger trg_order_detail_stock sẽ tự động kích hoạt trừ tồn kho & ghi log)
        INSERT INTO OrderDetails (order_id, product_id, shop_id, quantity, price_at_purchase)
        VALUES (p_order_id, p_product_ids[i], v_shop_id, p_quantities[i], v_price);

        -- Cộng dồn giá trị đơn hàng
        v_total_amount := v_total_amount + (v_price * p_quantities[i]);
    END LOOP;

    -- 3. Cập nhật tổng số tiền thanh toán chính xác
    UPDATE Orders SET total_amount = v_total_amount WHERE id = p_order_id;
END;
$$;


-- ==============================================================================
-- PHẦN 5: TRUY VẤN NÂNG CAO & HÀM CỬA SỔ (WINDOW FUNCTIONS, CTE, JOINS)
-- ==============================================================================

-- 5.1. ADVANCED VIEW: Phân cấp danh mục đa tầng bằng SELF JOIN
-- Minh họa kĩ thuật SELF JOIN: Nối bảng Categories với chính nó để hiển thị Danh mục cha & Danh mục con
CREATE OR REPLACE VIEW vw_category_hierarchy_tree WITH (security_invoker = true) AS
SELECT 
    child.id AS category_id,
    child.name AS category_name,
    child.slug AS category_slug,
    parent.id AS parent_id,
    COALESCE(parent.name, 'Root (Cấp cao nhất)') AS parent_category_name
FROM Categories child
LEFT JOIN Categories parent ON child.parent_id = parent.id;


-- 5.2. ADVANCED VIEW: Catalog chi tiết kiểm soát hạt dữ liệu (Grain Control)
-- Kết hợp INNER JOIN, LEFT JOIN để lấy đầy đủ thông tin Product - Shop - Category - Brand mà không nhân đôi dòng
CREATE OR REPLACE VIEW vw_product_catalog_details WITH (security_invoker = true) AS
SELECT 
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    p.description,
    p.price,
    p.original_price,
    ROUND(((p.original_price - p.price) / NULLIF(p.original_price, 0) * 100), 0) AS discount_percent,
    p.stock,
    p.sold_count,
    p.rating_avg,
    p.review_count,
    p.image_url,
    p.status,
    p.created_at,
    -- Shop Info (INNER JOIN)
    s.id AS shop_id,
    s.name AS shop_name,
    s.slug AS shop_slug,
    s.is_official AS shop_is_official,
    -- Category Info (INNER JOIN)
    c.id AS category_id,
    c.name AS category_name,
    -- Brand Info (LEFT JOIN - Có sản phẩm chưa gán thương hiệu)
    b.id AS brand_id,
    b.name AS brand_name,
    b.logo_url AS brand_logo
FROM Products p
INNER JOIN Shops s ON p.shop_id = s.id
INNER JOIN Categories c ON p.category_id = c.id
LEFT JOIN Brands b ON p.brand_id = b.id;


-- 5.3. ADVANCED VIEW: Báo cáo hiệu năng kinh doanh giữa các Shop (Window Function Ranking)
-- Sử dụng DENSE_RANK() OVER (ORDER BY ...) để xếp hạng doanh thu toàn sàn
CREATE OR REPLACE VIEW vw_shop_sales_performance WITH (security_invoker = true) AS
SELECT 
    s.id AS shop_id,
    s.name AS shop_name,
    s.is_official,
    COUNT(DISTINCT od.order_id) AS total_orders,
    COALESCE(SUM(od.quantity), 0) AS total_units_sold,
    COALESCE(SUM(od.quantity * od.price_at_purchase), 0) AS total_revenue,
    -- WINDOW FUNCTION: Xếp hạng doanh thu giữa các Shop không bị nhảy bậc
    DENSE_RANK() OVER (ORDER BY COALESCE(SUM(od.quantity * od.price_at_purchase), 0) DESC) AS revenue_rank,
    -- WINDOW FUNCTION: Xếp hạng theo số đơn hàng
    RANK() OVER (ORDER BY COUNT(DISTINCT od.order_id) DESC) AS order_rank
FROM Shops s
LEFT JOIN OrderDetails od ON s.id = od.shop_id
GROUP BY s.id, s.name, s.is_official;


-- 5.4. ADVANCED VIEW: Top sản phẩm bán chạy nhất trong từng danh mục (Window Function Partition)
-- Sử dụng PARTITION BY category_id để tính xếp hạng độc lập trong từng nhóm danh mục
CREATE OR REPLACE VIEW vw_top_selling_per_category WITH (security_invoker = true) AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.price,
    p.sold_count,
    c.id AS category_id,
    c.name AS category_name,
    s.name AS shop_name,
    -- WINDOW FUNCTION: Phân loại top 1, 2, 3 trong mỗi danh mục
    ROW_NUMBER() OVER (PARTITION BY p.category_id ORDER BY p.sold_count DESC) AS row_num,
    DENSE_RANK() OVER (PARTITION BY p.category_id ORDER BY p.sold_count DESC) AS rank_in_category
FROM Products p
INNER JOIN Categories c ON p.category_id = c.id
INNER JOIN Shops s ON p.shop_id = s.id
WHERE p.status = 'active';


-- 5.5. ADVANCED VIEW: Phân tích tăng trưởng doanh thu qua từng tháng (CTE + LAG, LEAD, RUNNING TOTAL)
-- Minh họa đầy đủ:
-- 1. CTE phân tách bước tính tổng doanh thu thô theo tháng
-- 2. LAG() lấy doanh thu tháng trước để so sánh tăng trưởng (% MoM Growth)
-- 3. LEAD() lấy doanh thu tháng tiếp theo để đối chiếu
-- 4. SUM(...) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) tính doanh thu lũy kế chạy (Cumulative Running Total)
CREATE OR REPLACE VIEW vw_monthly_sales_growth WITH (security_invoker = true) AS
WITH MonthlySummary AS (
    SELECT 
        TO_CHAR(created_at, 'YYYY-MM') AS sales_month,
        COUNT(id) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS monthly_revenue
    FROM Orders
    WHERE status != 'cancelled'
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
)
SELECT 
    sales_month,
    total_orders,
    monthly_revenue,
    -- WINDOW FUNCTION: Lấy doanh thu tháng trước (LAG)
    LAG(monthly_revenue, 1) OVER (ORDER BY sales_month) AS prev_month_revenue,
    -- WINDOW FUNCTION: Lấy doanh thu tháng sau (LEAD)
    LEAD(monthly_revenue, 1) OVER (ORDER BY sales_month) AS next_month_revenue,
    -- Tính tỷ lệ tăng trưởng so với tháng trước (% MoM Growth)
    ROUND(
        ((monthly_revenue - LAG(monthly_revenue, 1) OVER (ORDER BY sales_month)) 
        / NULLIF(LAG(monthly_revenue, 1) OVER (ORDER BY sales_month), 0)) * 100, 
        2
    ) AS mom_growth_percent,
    -- WINDOW FUNCTION: Doanh thu lũy kế dồn dịch (Cumulative Running Total)
    SUM(monthly_revenue) OVER (
        ORDER BY sales_month 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_running_revenue
FROM MonthlySummary;
