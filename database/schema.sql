-- Drop tables if they exist
DROP VIEW IF EXISTS vw_admin_sales_summary;
DROP TABLE IF EXISTS InventoryLogs CASCADE;
DROP TABLE IF EXISTS Reviews CASCADE;
DROP TABLE IF EXISTS OrderDetails CASCADE;
DROP TABLE IF EXISTS Orders CASCADE;
DROP TABLE IF EXISTS Products CASCADE;
DROP TABLE IF EXISTS Categories CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- 1. Users Table
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE Categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- 3. Products Table
CREATE TABLE Products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES Categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Composite Index for performance on searches
CREATE INDEX idx_products_category_price ON Products (category_id, price);

-- 4. Orders Table
CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'shipped', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. OrderDetails Table
CREATE TABLE OrderDetails (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES Products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_purchase NUMERIC(10, 2) NOT NULL CHECK (price_at_purchase > 0)
);

-- 6. Reviews Table
CREATE TABLE Reviews (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES Products(id) ON DELETE CASCADE,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. InventoryLogs Table
CREATE TABLE InventoryLogs (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES Products(id) ON DELETE CASCADE,
    change_amount INT NOT NULL,
    reason VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger Function: Auto-deduct stock & log inventory when an OrderDetail is inserted
CREATE OR REPLACE FUNCTION trg_after_order_detail_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Deduct stock
    UPDATE Products 
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;

    -- Log inventory
    INSERT INTO InventoryLogs (product_id, change_amount, reason)
    VALUES (NEW.product_id, -NEW.quantity, 'Order placed - ID: ' || NEW.order_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_order_detail_insert
AFTER INSERT ON OrderDetails
FOR EACH ROW
EXECUTE FUNCTION trg_after_order_detail_insert();


-- View: Sales Summary for Admin
CREATE VIEW vw_admin_sales_summary AS
SELECT 
    DATE(o.created_at) AS sale_date,
    COUNT(DISTINCT o.id) AS total_orders,
    SUM(od.quantity) AS items_sold,
    SUM(od.quantity * od.price_at_purchase) AS daily_revenue
FROM Orders o
JOIN OrderDetails od ON o.id = od.order_id
WHERE o.status != 'cancelled'
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;


-- Stored Procedure: Thread-safe checkout transaction
-- Note: In PostgreSQL, stored procedures can commit/rollback. 
-- However, we will manage the transaction block via Node.js OR handle it purely inside this procedure.
-- Taking arrays of product_ids and quantities to insert them sequentially.

CREATE OR REPLACE PROCEDURE sp_checkout(
    p_user_id INT,
    p_product_ids INT[],
    p_quantities INT[],
    OUT p_order_id INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_amount NUMERIC(10, 2) := 0;
    v_price NUMERIC(10, 2);
    v_stock INT;
    i INT;
BEGIN
    -- 1. Create the Order initially with 0 total
    INSERT INTO Orders (user_id, status) VALUES (p_user_id, 'completed') RETURNING id INTO p_order_id;

    -- 2. Loop through cart items
    FOR i IN 1 .. array_length(p_product_ids, 1) LOOP
        -- Lock the product row to prevent race conditions during stock check
        SELECT price, stock INTO v_price, v_stock 
        FROM Products 
        WHERE id = p_product_ids[i] 
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product ID % not found', p_product_ids[i];
        END IF;

        IF v_stock < p_quantities[i] THEN
            RAISE EXCEPTION 'Insufficient stock for product ID %', p_product_ids[i];
        END IF;

        -- Insert Order Detail (Trigger will auto-deduct stock and log)
        INSERT INTO OrderDetails (order_id, product_id, quantity, price_at_purchase)
        VALUES (p_order_id, p_product_ids[i], p_quantities[i], v_price);

        -- Add to total amount
        v_total_amount := v_total_amount + (v_price * p_quantities[i]);
    END LOOP;

    -- 3. Update the total amount in the Orders table
    UPDATE Orders SET total_amount = v_total_amount WHERE id = p_order_id;

    -- Procedure completes successfully, implicit commit happens
END;
$$;
