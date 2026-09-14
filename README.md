# 🛒 Dự án ShopLite AI - E-commerce Platform

Chào mừng bạn đến với tài liệu tổng hợp của dự án ShopLite AI. File này đóng vai trò là "bản lề" ghi nhớ toàn bộ tiến độ dự án, kiến trúc kỹ thuật và là tài liệu (prompt) để cung cấp cho AI trong các lần làm việc tiếp theo.

---

## 1. 🤖 BẢN TÓM TẮT DỰ ÁN DÀNH CHO AI (AI CONTEXT PROMPT)
*Khi bắt đầu một session mới với AI, hãy copy/paste phần này cho AI đọc để nó nhớ lại toàn bộ bối cảnh dự án:*

> **ROLE & CONTEXT FOR AI:**
> You are an Expert Full-Stack Developer. We are building "ShopLite AI", an advanced E-commerce platform with an AI Recommendation Engine.
> 
> **Current Tech Stack:**
> - **Backend:** Node.js, Express.js. REST API Architecture (Controllers, Routes).
> - **Database:** PostgreSQL. Contains tables: `Users`, `Categories`, `Products`, `Orders`, `OrderDetails`, `Reviews`, `InventoryLogs`. Includes raw SQL procedures (`sp_checkout`) and triggers (`trg_after_order_detail_insert`).
> - **Frontend:** React (Vite), Tailwind CSS v4, Lucide Icons, React Router. Styled using a custom "Indigo/Slate" theme with rounded corners and soft shadows.
> 
> **Key Features Implemented:**
> 1. Authentication (JWT based, Login/Register). Admin and Customer roles.
> 2. Product Catalog with real Unsplash images and stock management.
> 3. Shopping Cart (Context API + LocalStorage) and Checkout process.
> 4. Admin Dashboard (Revenue, Orders, Sales History).
> 5. **AI Recommendation Engine:** A "Best Sellers" global endpoint & "Frequently Bought Together" (Co-occurrence) widget based on `OrderDetails` history.
> 
> **Your rules for this project:** Do not change the database schema unless requested. Do not change the UI theme (keep it Indigo/Slate Apple-like). Always provide absolute paths or correct terminal commands when updating code.

---

## 2. 💻 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### Yêu cầu tiên quyết:
- Đã cài đặt **Node.js** (v18+).
- Đã cài đặt **PostgreSQL** và tạo database tên `ecommerce`.

### Bước 1: Setup Database
1. Mở `pgAdmin` hoặc trình quản lý SQL của bạn.
2. Chạy nội dung file `database/schema.sql` để tạo các bảng, trigger, procedures.
3. Chạy nội dung file `database/seed.sql` để đưa dữ liệu sản phẩm thật (iPhone, MacBook) và tài khoản mẫu vào hệ thống.

### Bước 2: Setup Backend
1. Mở terminal, trỏ vào thư mục `backend/`
2. Tạo file `.env` theo cấu trúc:
```env
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=ecommerce
DB_PASSWORD=mật_khẩu_postgres_của_bạn
DB_PORT=5432
PORT=3000
```
3. Chạy lệnh cài thư viện và khởi động:
```bash
npm install
node server.js
```

### Bước 3: Setup Frontend
1. Mở một terminal MỚI, trỏ vào thư mục `frontend/`
2. Chạy lệnh cài thư viện và khởi động Vite:
```bash
npm install
npm run dev
```
3. Mở trình duyệt truy cập: `http://localhost:5173`

*(Tài khoản Admin test: `admin@example.com` / `password123`)*

---

## 3. 🛠 BỘ LỆNH TERMINAL THƯỜNG DÙNG ĐỂ CHỈNH SỬA & CODE

Dưới đây là các lệnh bạn và team sẽ dùng mỗi ngày khi code:

### Khởi động nhanh dự án (Chia làm 2 tab terminal)
- **Tab 1 (Backend):**
  ```bash
  cd backend
  node server.js
  ```
  *(Mẹo: Nếu muốn code backend tự động refresh khi lưu file, hãy cài `npm install -g nodemon` và chạy lệnh `nodemon server.js` thay cho `node server.js`)*

- **Tab 2 (Frontend):**
  ```bash
  cd frontend
  npm run dev
  ```

### Các lệnh Git (Quản lý mã nguồn cơ bản)
- Xem file nào vừa bị chỉnh sửa: `git status`
- Lưu toàn bộ thay đổi: `git add .`
- Đóng gói thay đổi kèm ghi chú: `git commit -m "Ghi chú công việc vừa làm, vd: Thêm chức năng thanh toán"`
- Đẩy code lên GitHub cho bạn bè lấy về: `git push origin main`
- Lấy code mới nhất do bạn bè vừa đẩy lên: `git pull origin main`

### Cài thêm thư viện mới
- Nếu bạn cần thư viện cho React (Frontend): `cd frontend` -> `npm install tên-thư-viện`
- Nếu bạn cần thư viện cho Node (Backend): `cd backend` -> `npm install tên-thư-viện`
