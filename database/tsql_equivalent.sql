-- 1.1. Advanced Joins & Kiểm soát hạt dữ liệu (Grain Control)
-- Tránh lỗi nhân đôi dòng (Row Multiplication) khi nối quan hệ 1-N:
SELECT 
    p.id AS ProductID,
    p.name AS ProductName,
    p.price AS Price,
    c.name AS CategoryName,
    b.name AS BrandName,
    s.name AS ShopName
FROM Products p
INNER JOIN Categories c ON p.category_id = c.id           -- INNER JOIN: Bắt buộc có danh mục
INNER JOIN Shops s ON p.shop_id = s.id                     -- INNER JOIN: Bắt buộc có Shop
LEFT OUTER JOIN Brands b ON p.brand_id = b.id;             -- LEFT JOIN: Sản phẩm có thể chưa có thương hiệu

-- 1.2. Self Join: Bảng phân cấp danh mục cha - con
SELECT 
    child.id AS CategoryID,
    child.name AS CategoryName,
    ISNULL(parent.name, N'Root (Danh mục gốc)') AS ParentCategoryName
FROM Categories child
LEFT OUTER JOIN Categories parent ON child.parent_id = parent.id;

-- 1.3. Subquery với EXISTS & NOT EXISTS
-- Tìm khách hàng chưa từng phát sinh bất kỳ đơn hàng nào:
SELECT u.id, u.name, u.email, u.phone
FROM Users u
WHERE u.role = 'customer'
  AND NOT EXISTS (
      SELECT 1 
      FROM Orders o 
      WHERE o.user_id = u.id
  );

-- 1.4. Common Table Expressions (CTE) & Đệ quy (Recursive CTE)
-- Duyệt ngược từ danh mục con lên danh mục cha tạo chuỗi Breadcrumb:
WITH CategoryHierarchy AS (
    -- Anchor Member: Bắt đầu từ danh mục truyền vào
    SELECT id, parent_id, CAST(name AS NVARCHAR(MAX)) AS Breadcrumb
    FROM Categories
    WHERE id = 10 -- Ví dụ: 'Smartphones & Accessories' (con của 'Electronics & Technology')

    UNION ALL

    -- Recursive Member: Truy ngược lên danh mục cha
    SELECT c.id, c.parent_id, CAST(c.name + N' > ' + ch.Breadcrumb AS NVARCHAR(MAX))
    FROM Categories c
    INNER JOIN CategoryHierarchy ch ON c.id = ch.parent_id
)
SELECT id, Breadcrumb
FROM CategoryHierarchy
WHERE parent_id IS NULL;

-- 1.5. Hàm cửa sổ (Window Functions)
-- Xếp hạng: ROW_NUMBER(), RANK(), DENSE_RANK()
-- Điều hướng: LAG(), LEAD() so sánh tăng trưởng
-- Tập hợp cửa sổ: SUM(...) OVER (ORDER BY ... ROWS ...)
WITH MonthlySales AS (
    SELECT 
        FORMAT(created_at, 'yyyy-MM') AS SalesMonth,
        COUNT(id) AS TotalOrders,
        SUM(total_amount) AS MonthlyRevenue
    FROM Orders
    WHERE status != 'cancelled'
    GROUP BY FORMAT(created_at, 'yyyy-MM')
)
SELECT 
    SalesMonth,
    TotalOrders,
    MonthlyRevenue,
    -- Điều hướng: Lấy doanh thu tháng trước bằng LAG
    LAG(MonthlyRevenue, 1, 0) OVER (ORDER BY SalesMonth) AS PrevMonthRevenue,
    -- Điều hướng: Lấy doanh thu tháng sau bằng LEAD
    LEAD(MonthlyRevenue, 1, 0) OVER (ORDER BY SalesMonth) AS NextMonthRevenue,
    -- Tính tỷ lệ tăng trưởng tháng MoM (% Growth)
    ROUND(
        ((MonthlyRevenue - LAG(MonthlyRevenue, 1, 0) OVER (ORDER BY SalesMonth)) 
        / NULLIF(LAG(MonthlyRevenue, 1, 0) OVER (ORDER BY SalesMonth), 0)) * 100.0, 
        2
    ) AS MoM_Growth_Percent,
    -- Tập hợp cửa sổ: Doanh thu tích lũy dồn dịch (Cumulative Running Total)
    SUM(MonthlyRevenue) OVER (
        ORDER BY SalesMonth 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS CumulativeRevenue
FROM MonthlySales;


-- ==============================================================================
-- 2. HÀM (FUNCTIONS) ĐÚNG NGHIỆP VỤ THỰC TẾ
-- ==============================================================================

-- 2.1. Hàm vô hướng (Scalar Function): Tính tổng tiền mặt hàng sau chiết khấu
CREATE OR ALTER FUNCTION dbo.fn_CalculateItemTotal (
    @Price DECIMAL(12, 2),
    @Quantity INT,
    @DiscountPercent DECIMAL(5, 2) = 0
)
RETURNS DECIMAL(12, 2)
AS
BEGIN
    IF @Quantity <= 0 RETURN 0.00;
    RETURN ROUND(@Quantity * @Price * (1.0 - (@DiscountPercent / 100.0)), 2);
END;
GO

-- 2.2. Hàm vô hướng: Trả về trạng thái kinh doanh của tồn kho
CREATE OR ALTER FUNCTION dbo.fn_GetStockStatusLabel (
    @Stock INT
)
RETURNS NVARCHAR(50)
AS
BEGIN
    IF @Stock <= 0 RETURN N'Hết hàng';
    IF @Stock <= 10 RETURN N'Sắp hết hàng (Cần nhập)';
    RETURN N'Còn hàng';
END;
GO

-- 2.3. Hàm trả về bảng (Inline Table-Valued Function - TVF)
-- Lọc và trả về toàn bộ sản phẩm thuộc thương hiệu chỉ định
CREATE OR ALTER FUNCTION dbo.fn_GetProductsByBrand (
    @BrandID INT
)
RETURNS TABLE
AS
RETURN (
    SELECT 
        p.id AS ProductID,
        p.name AS ProductName,
        p.price AS Price,
        p.original_price AS OriginalPrice,
        p.stock AS Stock,
        dbo.fn_GetStockStatusLabel(p.stock) AS StockStatus,
        p.sold_count AS SoldCount,
        b.name AS BrandName,
        s.name AS ShopName
    FROM Products p
    INNER JOIN Brands b ON p.brand_id = b.id
    INNER JOIN Shops s ON p.shop_id = s.id
    WHERE p.brand_id = @BrandID AND p.status = 'active'
);
GO


-- ==============================================================================
-- 3. BẪY LỖI TỰ ĐỘNG (TRIGGERS) ĐÚNG NGHIỆP VỤ
-- Làm việc trực tiếp trên 2 bảng ảo trong bộ nhớ: inserted và deleted
-- ==============================================================================

-- 3.1. TRIGGER: Tự động trừ tồn kho (AFTER INSERT) & Chống bán âm kho
CREATE OR ALTER TRIGGER trg_OrderDetails_DeductStock
ON OrderDetails
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra nếu số lượng đặt vượt quá tồn kho hiện tại
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        INNER JOIN Products p ON i.product_id = p.id
        WHERE i.quantity > p.stock
    )
    BEGIN
        ;THROW 50001, N'Lỗi nghiệp vụ: Số lượng đặt hàng vượt quá tồn kho thực tế! Giao dịch bị hủy.', 1;
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Trừ tồn kho và cộng dồn số lượng bán từ bảng ảo inserted
    UPDATE p
    SET 
        p.stock = p.stock - i.quantity,
        p.sold_count = p.sold_count + i.quantity
    FROM Products p
    INNER JOIN inserted i ON p.id = i.product_id;

    -- Ghi vết nhật ký biến động kho
    INSERT INTO InventoryLogs (product_id, change_amount, reason, created_at)
    SELECT 
        i.product_id, 
        -i.quantity, 
        N'Bán hàng đơn #' + CAST(i.order_id AS NVARCHAR(20)), 
        GETDATE()
    FROM inserted i;
END;
GO

-- 3.2. TRIGGER: Ghi nhật ký kiểm toán biến động sản phẩm (Audit Log - AFTER INSERT, UPDATE, DELETE)
CREATE OR ALTER TRIGGER trg_Products_AuditLog
ON Products
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Trường hợp INSERT: Chỉ có bảng ảo inserted
    IF EXISTS(SELECT 1 FROM inserted) AND NOT EXISTS(SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO ProductAuditLogs (product_id, action_type, new_price, new_stock, changed_at, note)
        SELECT id, 'INS', price, stock, GETDATE(), N'Thêm mới sản phẩm: ' + name
        FROM inserted;
    END

    -- Trường hợp UPDATE: Có cả inserted (mới) và deleted (cũ)
    IF EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO ProductAuditLogs (product_id, action_type, old_price, new_price, old_stock, new_stock, changed_at, note)
        SELECT 
            i.id, 'UPD', d.price, i.price, d.stock, i.stock, GETDATE(), N'Cập nhật giá hoặc kho sản phẩm: ' + i.name
        FROM inserted i
        INNER JOIN deleted d ON i.id = d.id;
    END

    -- Trường hợp DELETE: Chỉ có bảng ảo deleted
    IF NOT EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO ProductAuditLogs (product_id, action_type, old_price, old_stock, changed_at, note)
        SELECT id, 'DEL', price, stock, GETDATE(), N'Xóa sản phẩm: ' + name
        FROM deleted;
    END
END;
GO

-- 3.3. TRIGGER: Bảo vệ quy tắc kinh doanh (Business Rule) - Chặn xóa danh mục nếu còn sản phẩm
CREATE OR ALTER TRIGGER trg_Categories_PreventDelete
ON Categories
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 
        FROM Products p
        INNER JOIN deleted d ON p.category_id = d.id
    )
    BEGIN
        ;THROW 50002, N'Quy tắc kinh doanh: Không thể xóa Danh mục khi vẫn còn sản phẩm trực thuộc!', 1;
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO


-- ==============================================================================
-- 4. THỦ TỤC (STORED PROCEDURE), QUẢN LÝ GIAO DỊCH & KHÓA (LOCKING)
-- ==============================================================================

-- Stored Procedure: Tạo đơn hàng, khóa dòng chống Overselling với UPDLOCK, HOLDLOCK
CREATE OR ALTER PROCEDURE dbo.sp_CreateCheckoutOrder
    @UserID INT,
    @ProductID INT,
    @Quantity INT,
    @ShippingAddress NVARCHAR(500),
    @NewOrderID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. PESSIMISTIC LOCKING: Khóa độc quyền kiểm tra tồn kho (UPDLOCK, HOLDLOCK)
        -- Ngăn chặn 2 người mua cùng lúc gây âm kho (Overselling / Race Condition)
        DECLARE @CurrentStock INT;
        DECLARE @Price DECIMAL(12, 2);
        DECLARE @ShopID INT;

        SELECT 
            @Price = price, 
            @CurrentStock = stock, 
            @ShopID = shop_id
        FROM Products WITH (UPDLOCK, HOLDLOCK)
        WHERE id = @ProductID;

        -- Kiểm tra tồn tại
        IF @Price IS NULL
        BEGIN
            ;THROW 50003, N'Sản phẩm không tồn tại trong hệ thống.', 1;
        END

        -- Kiểm tra số lượng
        IF @CurrentStock < @Quantity
        BEGIN
            ;THROW 50004, N'Sản phẩm đã hết hàng hoặc không đủ tồn kho cung ứng.', 1;
        END

        -- 2. Tạo đơn hàng mới
        DECLARE @TotalAmount DECIMAL(12, 2) = @Price * @Quantity;

        INSERT INTO Orders (user_id, total_amount, shipping_address, status, created_at)
        VALUES (@UserID, @TotalAmount, @ShippingAddress, 'completed', GETDATE());

        SET @NewOrderID = SCOPE_IDENTITY();

        -- 3. Thêm chi tiết đơn hàng (Trigger trg_OrderDetails_DeductStock sẽ tự trừ kho & ghi log)
        INSERT INTO OrderDetails (order_id, product_id, shop_id, quantity, price_at_purchase)
        VALUES (@NewOrderID, @ProductID, @ShopID, @Quantity, @Price);

        -- Xác nhận giao dịch thành công (ACID - Commit)
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Bắt lỗi & Rollback hủy giao dịch
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISEERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

