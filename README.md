# 🛒 Dự án ShopLite AI - E-commerce Platform (Mô hình Sàn Shopee Đa Người Bán)

Chào mừng bạn đến với tài liệu tổng hợp của dự án ShopLite AI. File này đóng vai trò là "bản lề" ghi nhớ toàn bộ tiến độ dự án, kiến trúc kỹ thuật và là tài liệu (prompt) để cung cấp cho AI trong các lần làm việc tiếp theo.

---

## 1. 🤖 BẢN TÓM TẮT DỰ ÁN DÀNH CHO AI (AI CONTEXT PROMPT)
*Khi bắt đầu một session mới với AI, hãy copy/paste toàn bộ đoạn trích dẫn bên dưới cho AI đọc để ghi nhớ trọn vẹn bối cảnh, kiến trúc và tiến độ dự án:*

> **ROLE & CONTEXT FOR AI:**
> You are an Expert Full-Stack Developer. We are building "ShopLite AI", an advanced E-commerce platform inspired by the Shopee Multi-Vendor Marketplace model, powered by an AI Recommendation Engine.
> 
> **Current Tech Stack:**
> - **Backend:** Node.js, Express.js. REST API Layered Architecture (Controllers, Routes, Middleware). Modules: `auth`, `shops`, `catalog`, `order`, `dashboard`, `reviews`.
> - **Database:** PostgreSQL (Supabase with IPv4 Transaction Pooler) & Microsoft SQL Server T-SQL Equivalent.
>   Tables: `Users`, `Shops`, `Categories`, `Brands`, `Category_Brands`, `Products`, `Orders`, `OrderDetails`, `Reviews`, `InventoryLogs`.
> - **Frontend:** React 19 (Vite), Tailwind CSS v4, Lucide Icons, React Router. Styled using a premium "Dark / Glassmorphism" theme (`#020204` background) with Apple-like aesthetics, neon glow borders, and complex 3D CSS transforms.
> - **Deployment Architecture:** Supabase (PostgreSQL Database using IPv4 Transaction Pooler), Render (Express Backend API), Vercel (React Frontend).
> 
> **Key Database & Advanced Relational Concepts Implemented (DBMS / T-SQL):**
> 1. **3NF & BCNF Normalization:** Strictly normalized schema. `Brands` and `Categories` separated into standalone entities; `Category_Brands` (N-N) junction table mapping world-class brands to specific categories.
> 2. **3 User Roles (RBAC):**
>    - `admin`: System administrator (KPI dashboard, shop rankings, sales analytics, full moderation).
>    - `customer`: Regular buyer (register, search, filter, cart, checkout, reviews, Shopee-style account center).
>    - `seller`: User who also owns a Shop (`Shops` table). Can list products with professional categorization (category, world-class brand, SKU, price, original_price, stock) and manage shop orders.
> 3. **ACID Stored Procedure with Pessimistic Locking:** `sp_checkout` uses `SELECT ... FOR UPDATE` (row-level exclusive lock) to prevent overselling / race conditions during simultaneous purchases, with automatic rollback on stock shortage.
> 4. **Automated Business Triggers:**
>    - `trg_order_detail_stock`: Auto-deducts stock, increments `sold_count`, and writes audit records to `InventoryLogs`.
>    - `trg_review_sync`: Auto-recalculates `rating_avg` and `review_count` for products upon review insertion/update/deletion.
>    - `trg_prevent_negative_price`: Validation trigger preventing negative prices or illegal discounts.
> 5. **Advanced Window Functions:**
>    - `vw_monthly_sales_growth`: Window functions using `LAG()` / `LEAD()` for month-over-month growth comparisons, and `SUM(...) OVER (ORDER BY ...)` for running total cumulative sales.
>    - `vw_shop_sales_performance`: Ranks shop revenues using `DENSE_RANK() OVER (ORDER BY total_revenue DESC)`.
>    - `vw_top_selling_per_category`: Ranks best sellers within each category using `DENSE_RANK() OVER (PARTITION BY category_id ORDER BY sold_count DESC)` and `ROW_NUMBER()`.
>    - `vw_product_catalog_details`: Enriches products with Shop, Brand, Category info and Shopee-style discount percentage.
> 6. **Functions (Scalar & TVF) & Recursive CTE:**
>    - Scalar Function: `fn_calculate_discounted_price(price, discount_percent)` to compute final price after discount.
>    - Table-Valued Function (TVF): `fn_get_products_by_brand(brand_id)` returning full product sets for simulated FROM-clause joins.
>    - Recursive CTE: `fn_get_category_path()` dynamically traverses hierarchical parent-child categories for breadcrumbs.
> 7. **Shopee-Style Authentication & Registration Flow:**
>    - 3-step registration flow: Step 1 (Phone number verification with simulated OTP), Step 2 (Password setup & profile creation), Step 3 (Success confirmation & auto-login redirect).
>    - Password security: Real-time criteria checking (minimum 6 characters, numbers, letters, special characters), dynamic strength meter, and matching confirmation check with independent show/hide toggles.
>    - Role simplification: Unified customer registration without role confusion (new registrants default to `customer` role).
> 8. **Shopee "My Account" Center (`ProfilePage.jsx` & `Navbar.jsx`):**
>    - Profile dropdown in header: "My Account", "My Purchase", "Logout".
>    - Left sidebar navigation with 3 main sections:
>      - Notifications (Đơn hàng & Khuyến mãi).
>      - My Account with 7 tabs: Profile, Banks & Cards (pre-configured VISA card + add card modal), Addresses, Change Password, Notification Settings, Privacy Settings, Personal Information.
>      - My Purchase (Đơn mua): Full order history tabs (All, To Pay, To Ship, To Receive, Completed, Cancelled, Return/Refund) with detailed status, thumbnails, and re-order actions.
> 9. **AI Recommendation Engine:** Frequently Bought Together (Co-occurrence algorithm via `OrderDetails` self-join) with category-based fallback.
> 10. **3D Vertex Hero & Visuals:** High-performance 3D rotating carousel and type-fitter built in React hooks (`VertexHero.jsx`), Shopee-inspired discount badges (`-X%`) and deterministic pricing.
> 11. **Clean Codebase Architecture:** Redundant legacy scripts and static HTML prototypes have been completely removed. Active code is strictly organized in `backend/` (layered `config`, `middleware`, `modules`), `database/` (SQL schemas, seeds, T-SQL equivalent), and `frontend/` (React/Vite).
> 12. **24 Standardized Categories & Multi-Brand Filtering (`CategoryPage.jsx`):**
>     - Strict category taxonomy (Nam ra nam, Nữ ra nữ, Điện tử, Mẹ & bé, Đồ chơi,...). Không lẫn lộn đầm váy vào thời trang nam hay sai danh mục.
>     - 84 Sản phẩm mẫu flagship chuẩn xác trong cả `database/seed.sql` và `frontend/src/data/categoryProducts.js`, đảm bảo mỗi danh mục đều có sản phẩm trực quan để test lọc giá, lọc thương hiệu.
>     - Bộ lọc tương tác đa thương hiệu (Brand checkbox) và bộ lọc khoảng giá (Min - Max) hỗ trợ tìm kiếm chính xác.
> 13. **Top Brands Marquee (`CategoryPage.jsx`):**
>     - Băng chuyền thương hiệu chính hãng mượt mà với logo SVG chính hãng, đã tinh chỉnh lược bỏ nhãn thừa "Official Shopee Mall" để giữ phong cách Dark Glassmorphism tối giản và chuyên nghiệp.
> 14. **Triệt để xử lý hình ảnh sản phẩm (Zero Broken Image Architecture):**
>     - Hệ thống xử lý ảnh thông minh `frontend/src/utils/productImages.js` với hàm `getSafeProductImage(product)` tự động nhận diện và thay thế các URL ảnh bị lỗi 404 (Samsung S24 Ultra, Apple Magic Mouse, Quần Jeans Uniqlo,...) bằng ảnh sắc nét, chất lượng cao.
>     - Bộ xử lý `handleImageError` triệt tiêu hoàn toàn các ô chữ nhật "No Image" màu đen, đồng bộ trên toàn bộ `HomePage.jsx` (3D Vertex Hero, Top Searches, Daily Discoveries), `CategoryPage.jsx` và `ProductDetailPage.jsx`.
> 
> **Test Accounts (Password for all: `password123`):**
> - Admin: `admin@shoplite.com`
> - Sellers: `apple_official@shoplite.com` (Apple Flagship Store), `nike_official@shoplite.com` (Nike Official Store), `samsung_official@shoplite.com` (Samsung Brand Store)
> - Customers: `customer1@gmail.com`, `customer2@gmail.com`
> 
> **Your rules for this project:** Do not change the database schema unless requested. Do not change the UI theme (keep the Dark/Glassmorphism theme intact). Always provide absolute paths or correct terminal commands when updating code.

---

## 2. 💻 HƯỚNG DẪN CÀI ĐẶT & CHẠY LOCAL (LOCAL DEVELOPMENT)

### Yêu cầu tiên quyết:
- Đã cài đặt **Node.js** (v18+).
- Dự án sử dụng **Supabase** làm Database chính thức (hoặc PostgreSQL local).

### Bước 1: Setup Backend
1. Mở terminal, trỏ vào thư mục `backend/`
2. Tạo file `.env` theo mẫu:
```env
DB_USER=postgres.id_cua_ban
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_DATABASE=postgres
DB_PASSWORD=mat_khau_cua_ban
DB_PORT=6543
PORT=3000
JWT_SECRET=supersecretjwtkey123!
```
*(Lưu ý: Bắt buộc dùng Session Pooler / Transaction Pooler hỗ trợ IPv4 của Supabase)*
3. Khởi chạy:
```bash
node server.js
```

### Bước 2: Setup Frontend
1. Mở terminal mới, trỏ vào thư mục `frontend/`
2. Tạo file `.env`:
   - Nếu chạy cả backend local: `VITE_API_URL=http://localhost:3000/api`
   - Nếu trỏ lên cloud Render: `VITE_API_URL=https://shoplite-api-c67i.onrender.com/api`
3. Khởi chạy Vite:
```bash
npm run dev
```
*(Mở trình duyệt: `http://localhost:5173`)*

---

## 3. 🚀 HƯỚNG DẪN DEPLOY TRỌN GÓI LÊN PRODUCTION (BÁO CÁO ĐỒ ÁN)

Dự án được triển khai theo mô hình Micro-services 3 tầng:

### Bước 1: Deploy Database lên Supabase
1. Đăng nhập vào [Supabase Dashboard](https://supabase.com).
2. Chọn dự án của bạn (nếu dự án bị Pause, bấm **Restore** để kích hoạt lại).
3. Vào tab **SQL Editor** ở thanh menu bên trái.
4. Mở file [database/schema.sql](database/schema.sql), copy toàn bộ nội dung và bấm **Run** để tạo bảng, views, triggers và stored procedure.
5. Mở file [database/seed.sql](database/seed.sql), copy toàn bộ nội dung và bấm **Run** để nạp dữ liệu mẫu gồm 3 role người dùng, 3 shop mall, các thương hiệu lớn và sản phẩm flagship.
6. Vào mục **Project Settings -> Database -> Connection Pooling**: Chọn chế độ **Transaction Mode** (Port `6543`) và copy chuỗi kết nối IPv4.

---

### Bước 2: Deploy Backend lên Render
1. Đẩy code mới nhất lên GitHub repository của bạn:
   ```bash
   git add .
   git commit -m "feat: Nang cap backend va database da nguoi ban chuan do an"
   git push origin master
   ```
2. Đăng nhập vào [Render Dashboard](https://dashboard.render.com).
3. Chọn Web Service backend của bạn (`shoplite-api`).
4. Vào mục **Environment** và cập nhật các biến môi trường:
   - `DB_USER`: `postgres.your_project_id`
   - `DB_HOST`: `aws-0-ap-southeast-1.pooler.supabase.com`
   - `DB_DATABASE`: `postgres`
   - `DB_PASSWORD`: Mật khẩu database Supabase của bạn
   - `DB_PORT`: `6543`
   - `PORT`: `3000`
   - `JWT_SECRET`: `supersecretjwtkey123!`
5. Bấm **Manual Deploy -> Deploy latest commit**. Đợi 1-2 phút Render build và khởi động thành công.

---

### Bước 3: Deploy Frontend lên Vercel
1. Đăng nhập vào [Vercel Dashboard](https://vercel.com).
2. Chọn project Frontend của bạn.
3. Vào **Settings -> Environment Variables**:
   - Thêm hoặc cập nhật biến: `VITE_API_URL` = `https://shoplite-api-c67i.onrender.com/api` (hoặc domain Render của bạn).
4. Vào mục **Deployments**, chọn **Redeploy** (Bắt buộc redeploy để Vite đóng gói lại biến môi trường mới vào file bundle tĩnh).
5. Truy cập link Vercel của bạn để trải nghiệm và mang đi thuyết trình đồ án!

---

## 4. 🛠 BỘ LỆNH GIT LÀM VIỆC NHÓM THƯỜNG DÙNG

- **Xem trạng thái thay đổi:** `git status`
- **Lưu toàn bộ thay đổi:** `git add .`
- **Đóng gói thay đổi:** `git commit -m "Nội dung cập nhật"`
- **Đẩy code lên GitHub:** `git push origin master`
- **Kéo code mới nhất từ bạn bè về:** `git pull origin master`
