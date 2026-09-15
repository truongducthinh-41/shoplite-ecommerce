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
> - **Frontend:** React (Vite), Tailwind CSS v4, Lucide Icons, React Router. Styled using a premium "Dark / Glassmorphism" theme (`#020204` background) with Apple-like aesthetics, neon glow borders, and complex 3D CSS transforms.
> - **Deployment Architecture:** Supabase (PostgreSQL Database using IPv4 Transaction Pooler), Render (Express Backend API), Vercel (React Frontend). 
> **Key Features Implemented:**
> 1. Authentication (JWT based, Login/Register). Admin and Customer roles.
> 2. Product Catalog with real Unsplash images and stock management.
> 3. Shopping Cart (Context API + LocalStorage) and Checkout process.
> 4. Admin Dashboard (Revenue, Orders, Sales History).
> 5. **AI Recommendation Engine:** A "Best Sellers" global endpoint & "Frequently Bought Together" (Co-occurrence) widget based on `OrderDetails` history.
> 6. **3D Vertex Hero:** A highly complex, performance-optimized 3D rotating carousel and type-fitter built in React hooks (`VertexHero.jsx`), rendering dynamic database products into 3D space.
> 
> **Your rules for this project:** Do not change the database schema unless requested. Do not change the UI theme (keep the Dark/Glassmorphism theme intact). Always provide absolute paths or correct terminal commands when updating code.

---

## 2. 💻 HƯỚNG DẪN CÀI ĐẶT & CHẠY LẠI DỰ ÁN (LOCAL DEVELOPMENT)
Dự án hiện đã được deploy lên Cloud, nhưng nếu bạn muốn code và thử nghiệm trên máy cá nhân, hãy làm theo các bước sau:

### Yêu cầu tiên quyết:
- Đã cài đặt **Node.js** (v18+).
- Dự án sử dụng **Supabase** làm Database chính thức (không cần chạy PostgreSQL ở local nữa).

### Bước 1: Setup Backend
1. Mở terminal, trỏ vào thư mục `backend/`
2. Tạo file `.env` theo cấu trúc giống như cấu hình bạn đã làm trên Supabase/Render:
```env
DB_USER=postgres.id_cua_ban
DB_HOST=aws-0-....pooler.supabase.com
DB_DATABASE=postgres
DB_PASSWORD=mat_khau_cua_ban
DB_PORT=6543
PORT=3000
```
*(Lưu ý: Bắt buộc dùng Session Pooler / Transaction Pooler hỗ trợ IPv4 của Supabase)*
3. Chạy lệnh cài thư viện và khởi động:
```bash
npm install
node server.js
```

### Bước 2: Setup Frontend
1. Mở một terminal MỚI, trỏ vào thư mục `frontend/`
2. Tạo file `.env`. Ở bước này bạn có 2 lựa chọn:

   **Lựa chọn A (Code cả Front & Back):** Trỏ về backend đang bật ở máy bạn:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
   
   **Lựa chọn B (Chỉ code Giao diện - Rất nhàn):** Trỏ thẳng lên API của Render. Bạn sẽ **KHÔNG CẦN** bật `node server.js` ở máy nữa!
   ```env
   VITE_API_URL=https://shoplite-api-c67i.onrender.com/api
   ```

3. Chạy lệnh cài thư viện và khởi động Vite:
```bash
npm install
npm run dev
```
4. Mở trình duyệt truy cập: `http://localhost:5173`

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

### Các lệnh Git (Quản lý mã nguồn cơ bản & Làm việc nhóm)

**1. Lấy dự án về máy (Dành cho thành viên mới/bạn bè):**
- Lấy dự án từ GitHub (Thay URL bằng link kho chứa của team bạn):
  `git clone https://github.com/your-username/your-repo-name.git`
- Di chuyển vào thư mục dự án vừa tải về: `cd your-repo-name`
- *Lưu ý: Sau khi tải code về, thành viên mới cần tạo các file `.env` và làm theo **Phần 2: Hướng dẫn cài đặt & chạy lại dự án** để chạy được dự án.*

**2. Lấy bản cập nhật mới nhất (Kéo code mới về):**
- Khi có người khác vừa cập nhật tính năng mới lên GitHub, bạn chạy lệnh sau để kéo code mới nhất về máy bạn:
  `git pull origin master` *(hoặc `git pull origin main`)*

**3. Lưu và đẩy code của bạn lên (Cho người khác lấy):**
- Xem các file bạn vừa chỉnh sửa: `git status`
- Lưu toàn bộ thay đổi: `git add .`
- Đóng gói thay đổi kèm ghi chú: `git commit -m "Ghi chú công việc vừa làm"`
- Đẩy code lên GitHub: `git push origin master` *(hoặc `git push origin main`)*

### Cài thêm thư viện mới
- Nếu bạn cần thư viện cho React (Frontend): `cd frontend` -> `npm install tên-thư-viện`
- Nếu bạn cần thư viện cho Node (Backend): `cd backend` -> `npm install tên-thư-viện`

---

## 4. 🚀 KIẾN TRÚC DEPLOYMENT (PRODUCTION)
Dự án được phân tách và triển khai theo chuẩn Micro-services cơ bản:
1. **Database (Supabase):** Chứa dữ liệu. Phải kết nối thông qua IPv4 Connection Pooler (Port 6543 hoặc 5432) do Vercel/Render không hỗ trợ IPv6 thuần. File cấu hình cần có `ssl: { rejectUnauthorized: false }`.
2. **Backend (Render):** Web Service chạy Node.js. Root `package.json` đã được cấu hình lệnh `"start": "node backend/server.js"` để tự động khởi động. Yêu cầu copy đầy đủ biến môi trường Supabase vào Render.
3. **Frontend (Vercel):** Tự động build bằng Vite. Giao tiếp với Backend qua biến môi trường `VITE_API_URL`. Khi cập nhật URL Backend, bắt buộc phải *Redeploy* trên Vercel để code được build lại.
