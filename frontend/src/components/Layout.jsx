import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const hotSearches = [
  'Áo thun nam cao cấp',
  'Túi xách nữ hàng hiệu',
  'Tai nghe không dây',
  'Đồng hồ thông minh',
  'Laptop gaming',
  'Nước hoa chính hãng',
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#020204] text-white selection:bg-indigo-500/30">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#050508] border-t border-white/8 mt-auto">

        {/* Hot Search Bar */}
        <div className="border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-sm font-bold text-white whitespace-nowrap">Tìm Kiếm Nổi Bật</span>
            {hotSearches.map((term, i) => (
              <a
                key={i}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
              >
                {term}
              </a>
            ))}
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Col 1 – Liên hệ */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Liên Hệ Với Aurastore</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Hotline & Chat trực tuyến (24/7)</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Trung tâm hỗ trợ</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Hướng dẫn đặt hàng</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Giao hàng & Nhận hàng</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Chính sách nhập khẩu</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Hướng dẫn đổi trả hàng</a></li>
              </ul>
            </div>

            {/* Col 2 – Về Aurastore */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Aurastore Việt Nam</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Về Aurastore</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Bán hàng cùng Aurastore</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Chương trình Affiliate</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Tuyển dụng</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Điều khoản sử dụng</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Chính sách bảo mật</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Báo chí</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Bảo vệ quyền sở hữu trí tuệ</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Quy chế hoạt động sàn</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Quy trình giải quyết tranh chấp</a></li>
              </ul>
            </div>

            {/* Col 3 – Tải ứng dụng */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Tải Ứng Dụng Aurastore</h3>
              <p className="text-sm text-slate-400 mb-4">Mua sắm nhanh hơn, ưu đãi riêng cho app</p>
              <div className="flex flex-col gap-3">
                {/* App Store */}
                <a href="#" className="flex items-center gap-3 bg-white/5 hover:bg-indigo-500/15 border border-white/10 hover:border-indigo-500/40 rounded-xl px-4 py-2.5 transition-all group">
                  <svg className="w-6 h-6 text-slate-300 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="leading-tight">
                    <div className="text-[10px] text-slate-400">Tải trên</div>
                    <div className="text-sm font-semibold text-white">App Store</div>
                  </div>
                </a>
                {/* Google Play */}
                <a href="#" className="flex items-center gap-3 bg-white/5 hover:bg-indigo-500/15 border border-white/10 hover:border-indigo-500/40 rounded-xl px-4 py-2.5 transition-all group">
                  <svg className="w-6 h-6 text-slate-300 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l14 8.5-14 8.5c-.5.33-1.5.33-1.5-.5zm2-14.3v11.6l9.3-5.8-9.3-5.8z"/>
                    <path d="M3.5 3.7L13 9l-2.1 2.1L3.5 3.7zM3.5 20.3l7.4-7.4L13 15l-9.5 5.3z"/>
                  </svg>
                  <div className="leading-tight">
                    <div className="text-[10px] text-slate-400">Tải trên</div>
                    <div className="text-sm font-semibold text-white">Google Play</div>
                  </div>
                </a>
                {/* AppGallery */}
                <a href="#" className="flex items-center gap-3 bg-white/5 hover:bg-indigo-500/15 border border-white/10 hover:border-indigo-500/40 rounded-xl px-4 py-2.5 transition-all group">
                  <svg className="w-6 h-6 text-slate-300 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                  </svg>
                  <div className="leading-tight">
                    <div className="text-[10px] text-slate-400">Khám phá trên</div>
                    <div className="text-sm font-semibold text-white">AppGallery</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Col 4 – Thông tin công ty */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Thông Tin Công Ty</h3>
              <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
                <p className="font-semibold text-slate-300">CÔNG TY TNHH AURASTORE VIỆT NAM</p>
                <p>Giấy CNĐKDN: 0309123456 – Ngày cấp: 01/01/2024, được sửa đổi lần thứ 1 ngày 01/06/2025.</p>
                <p>Cơ quan cấp: Phòng Đăng ký kinh doanh – Sở kế hoạch và Đầu tư TP.HCM</p>
                <p>Địa chỉ đăng ký kinh doanh: Tầng 15, Tòa nhà Landmark 81, Bình Thạnh, TP. Hồ Chí Minh, Việt Nam.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>&copy; {new Date().getFullYear()} Aurastore. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-indigo-400 transition-colors">Điều khoản</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Bảo mật</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Cookie</a>
            </div>
          </div>
        </div>

      </footer>
    </div>
  );
}
