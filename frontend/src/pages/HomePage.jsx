import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, Smartphone, Laptop, Headphones, Gamepad, Watch, Camera, Flame, Shirt, ShoppingBag, Baby, Monitor, Home, Sparkles, HeartPulse, Footprints, Briefcase, Coffee, Dumbbell, Store, Car, Book, Gamepad2, Gift, Box, Ticket, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import VertexHero from '../components/VertexHero';
import { calculatePricing } from '../utils/pricing';
import { FALLBACK_PRODUCTS } from '../data/categoryProducts';
import { getSafeProductImage, handleImageError } from '../utils/productImages';
import { generateBlendedDiscoverFeed, trackSearchQuery, matchProductSearch, trackProductInteraction } from '../utils/userTracker';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Popularity');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const navigate = useNavigate();

  const scrollContainerRef = useRef(null);
  const searchResultsRef = useRef(null);
  const observer = useRef();
  const { addToCart } = useCart();
  const LIMIT = 100; // Increased limit for Gợi ý hôm nay

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 450;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const lastProductElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // Tự động cuộn trang mượt mà xuống khu vực kết quả tìm kiếm khi search
  useEffect(() => {
    if (searchQuery && searchResultsRef.current) {
      const timer = setTimeout(() => {
        searchResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Fetch Initial Data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [productsData, bestSellersData] = await Promise.all([
          apiFetch(`/products?limit=${LIMIT}&offset=0&category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}&search=${encodeURIComponent(searchQuery)}`).catch(() => []),
          apiFetch('/products/bestsellers').catch(() => [])
        ]);

        let displayProducts = [];

        // TRƯỜNG HỢP 1: NGƯỜI DÙNG ĐANG TÌM KIẾM
        if (searchQuery) {
          // Bóc tách sản phẩm khớp đúng từ khóa tìm kiếm (hỗ trợ cả từ đồng nghĩa)
          const matchedDbProducts = (productsData || []).filter(p => matchProductSearch(p, searchQuery));
          const matchedFallback = FALLBACK_PRODUCTS.filter(p => matchProductSearch(p, searchQuery));

          // Gộp lại để có danh sách tìm kiếm phong phú NHƯNG CHỈ ĐÚNG DANH MỤC / SẢN PHẨM KHỚP
          const searchMap = new Map();
          matchedDbProducts.forEach(p => searchMap.set(p.id, { ...p, image_url: getSafeProductImage(p) }));
          matchedFallback.forEach(p => {
            if (!searchMap.has(p.id)) {
              searchMap.set(p.id, { ...p, image_url: getSafeProductImage(p) });
            }
          });

          displayProducts = Array.from(searchMap.values());
          // Ghi nhận hành vi tìm kiếm phục vụ Giải pháp 3
          trackSearchQuery(searchQuery);
        } else {
          // TRƯỜNG HỢP 2: TRANG CHỦ CHÍNH (GIẢI PHÁP 3: RETARGETING & ĐAN XEN RANDOM)
          // Hợp nhất dữ liệu để luôn đảm bảo đầy đủ tối thiểu 108 sản phẩm trên trang chủ
          const catalogMap = new Map();
          FALLBACK_PRODUCTS.forEach(p => catalogMap.set(p.id, p));
          if (Array.isArray(productsData) && productsData.length > 0) {
            productsData.forEach(p => catalogMap.set(p.id, p));
          }

          const sanitizedProducts = Array.from(catalogMap.values()).map(p => ({
            ...p,
            image_url: getSafeProductImage(p)
          }));

          // Áp dụng Động cơ Gợi ý Cá nhân hóa Đan xen & Randomize trên mỗi lần F5 / về Home
          // Đảm bảo số lượng sản phẩm cực kỳ phong phú và liên tục đổi mới
          if (category === 'All' && sort === 'Popularity') {
            displayProducts = generateBlendedDiscoverFeed(sanitizedProducts);
          } else {
            displayProducts = sanitizedProducts;
          }
        }

        const rawBestSellers = (bestSellersData && bestSellersData.length > 0)
          ? bestSellersData
          : [...FALLBACK_PRODUCTS].sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)).slice(0, 8);

        const sanitizedBestSellers = rawBestSellers.map(p => ({
          ...p,
          image_url: getSafeProductImage(p)
        }));

        setProducts(displayProducts);
        setBestSellers(sanitizedBestSellers);

        setPage(0);
        setHasMore(productsData && productsData.length === LIMIT);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        setProducts(FALLBACK_PRODUCTS.map(p => ({ ...p, image_url: getSafeProductImage(p) })));
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [category, sort, searchQuery]);

  // Fetch More Data on Page Change
  useEffect(() => {
    if (page === 0) return;
    const loadMore = async () => {
      setLoadingMore(true);
      try {
        const offset = page * LIMIT;
        const newProducts = await apiFetch(`/products?limit=${LIMIT}&offset=${offset}&category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}&search=${encodeURIComponent(searchQuery)}`).catch(() => []);
        if (newProducts && newProducts.length > 0) {
          let sanitizedNew = newProducts.map(p => ({
            ...p,
            image_url: getSafeProductImage(p)
          }));
          if (searchQuery) {
            sanitizedNew = sanitizedNew.filter(p => matchProductSearch(p, searchQuery));
          }
          setProducts(prev => [...prev, ...sanitizedNew]);
          setHasMore(newProducts.length === LIMIT && sanitizedNew.length > 0);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Failed to load more products:', error);
      } finally {
        setLoadingMore(false);
      }
    };
    loadMore();
  }, [page]);

  const categoryIcons = [
    { name: "Men's Fashion", label: 'Thời Trang Nam', icon: Shirt },
    { name: "Women's Fashion", label: 'Thời Trang Nữ', icon: ShoppingBag },
    { name: 'Smartphones & Accessories', label: 'Điện Thoại & Phụ Kiện', icon: Smartphone },
    { name: 'Mom & Baby', label: 'Mẹ & Bé', icon: Baby },
    { name: 'Electronics', label: 'Điện Tử', icon: Monitor },
    { name: 'Home & Living', label: 'Nhà Cửa & Đời Sống', icon: Home },
    { name: 'Laptops & Computers', label: 'Máy Tính & Laptop', icon: Laptop },
    { name: 'Beauty', label: 'Làm Đẹp', icon: Sparkles },
    { name: 'Cameras', label: 'Máy Ảnh', icon: Camera },
    { name: 'Health', label: 'Sức Khỏe', icon: HeartPulse },
    { name: 'Watches', label: 'Đồng Hồ', icon: Watch },
    { name: "Women's Shoes", label: 'Giày Nữ', icon: Footprints },
    { name: "Men's Shoes", label: 'Giày Nam', icon: Footprints },
    { name: "Women's Bags", label: 'Túi Xách Nữ', icon: Briefcase },
    { name: 'Smart Home & Appliances', label: 'Nhà Thông Minh', icon: Coffee },
    { name: 'Audio', label: 'Âm Thanh', icon: Headphones },
    { name: 'Sports & Outdoors', label: 'Thể Thao & Ngoài Trời', icon: Dumbbell },
    { name: 'Groceries', label: 'Thực Phẩm', icon: Store },
    { name: 'Automotive', label: 'Ô Tô & Xe Máy', icon: Car },
    { name: 'Books & Stationery', label: 'Sách & Văn Phòng Phẩm', icon: Book },
    { name: 'Gaming', label: 'Gaming', icon: Gamepad2 },
    { name: 'Pet Supplies', label: 'Thú Cưng', icon: Box },
    { name: 'Gifts', label: 'Quà Tặng', icon: Gift },
    { name: 'Vouchers', label: 'Phiếu Giảm Giá', icon: Ticket },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Banner (3D Effect) */}
      <VertexHero products={products} bestSellers={bestSellers} />
      <div className="mb-12 mt-12"></div>

      {/* Categories Section (Danh Mục) */}
      <div className="mb-8 bg-[#111] rounded-2xl border border-white/10 p-4 sm:p-6 shadow-sm relative group/cats">
        <h2 className="text-base sm:text-lg font-bold text-white mb-2 uppercase tracking-wider">Danh Mục</h2>

        {/* Floating Side Arrows on desktop hover */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex absolute left-2 top-[58%] -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-[#18181b]/90 border border-white/20 text-white shadow-xl backdrop-blur-md opacity-0 group-hover/cats:opacity-100 hover:bg-indigo-600 hover:border-indigo-500 transition-all active:scale-90"
          title="Trượt sang trái"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleScroll('right')}
          className="hidden md:flex absolute right-2 top-[58%] -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-[#18181b]/90 border border-white/20 text-white shadow-xl backdrop-blur-md opacity-0 group-hover/cats:opacity-100 hover:bg-indigo-600 hover:border-indigo-500 transition-all active:scale-90"
          title="Trượt sang phải"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={scrollContainerRef}
          className="grid grid-rows-2 auto-cols-[85px] sm:auto-cols-[95px] grid-flow-col overflow-x-auto gap-y-3 gap-x-3 pb-2.5 pt-1 -mx-2 px-2 sm:-mx-4 sm:px-4 snap-x [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-indigo-500/40 hover:[&::-webkit-scrollbar-thumb]:bg-indigo-500 [&::-webkit-scrollbar-thumb]:rounded-full transition-all"
        >
          {categoryIcons.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`)}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all snap-start bg-white/5 border-transparent text-slate-400 hover:bg-indigo-500/20 hover:border-indigo-500 hover:text-indigo-400 hover:scale-105 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)]`}
            >
              <cat.icon className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-[10px] font-semibold text-center leading-tight line-clamp-2">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Best Sellers / Tìm Kiếm Hàng Đầu (Ẩn khi người dùng đang tìm kiếm) */}
      {!searchQuery && bestSellers.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6 text-amber-500">
            <Flame className="w-6 h-6 fill-current" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white">Tìm Kiếm Hàng Đầu</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map(product => {
              const { salePrice, originalPrice, discountPercent, hasDiscount } = calculatePricing(product);
              return (
                <div key={product.id} className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all group flex flex-col relative h-full">
                  {/* Top Badge */}
                  <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-[10px] sm:text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full shadow-sm">TOP</span>

                  <Link to={`/product/${product.id}`} onClick={() => trackProductInteraction(product, 'view')} className="block w-full relative aspect-square bg-white/5 overflow-hidden">
                    <img
                      src={getSafeProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      data-category-id={product.category_id}
                      onError={handleImageError}
                    />
                  </Link>

                  <div className="px-4 pb-4 pt-3 flex flex-col flex-grow">
                    <Link to={`/product/${product.id}`} onClick={() => trackProductInteraction(product, 'view')}>
                      <h3 className="font-semibold text-white hover:text-indigo-400 transition-colors line-clamp-2 text-sm min-h-[40px]">{product.name}</h3>
                    </Link>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex flex-col">
                        {hasDiscount ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-500 line-through">${originalPrice}</span>
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/30">
                                -{discountPercent}%
                              </span>
                            </div>
                            <span className="text-base sm:text-lg font-bold text-rose-400">${salePrice}</span>
                          </>
                        ) : (
                          <span className="text-base sm:text-lg font-bold text-indigo-400">${salePrice}</span>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="p-1.5 sm:p-2 bg-white/10 text-indigo-400 rounded-full hover:bg-indigo-500 hover:text-white transition-colors border border-transparent"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gợi Ý Hôm Nay / Search Results (Dòng sản phẩm đan xen thuật toán cá nhân hóa Shopee/TikTok) */}
      <div ref={searchResultsRef} className="mb-12 scroll-mt-20">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 via-purple-500 to-rose-500 rounded-full"></div>
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
              {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 'Gợi Ý Hôm Nay'}
            </h2>
          </div>
          {searchQuery && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                {products.length} sản phẩm phù hợp
              </span>
              <button
                onClick={() => navigate('/')}
                className="text-xs text-slate-400 hover:text-white underline transition-colors"
              >
                Về Trang Chủ
              </button>
            </div>
          )}
        </div>

        <div className="w-full">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {products.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 rounded-2xl border border-dashed border-white/20">
                  <p>No products found.</p>
                </div>
              ) : products.map((product, index) => {
                const isLast = products.length === index + 1;
                const { salePrice, originalPrice, discountPercent, hasDiscount } = calculatePricing(product);
                return (
                  <div ref={isLast ? lastProductElementRef : null} key={product.id} className="bg-[#111] rounded-xl border border-white/10 overflow-hidden hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all group flex flex-col h-full relative">
                    <Link to={`/product/${product.id}`} onClick={() => trackProductInteraction(product, 'view')} className="block w-full relative aspect-square bg-white/5 overflow-hidden">
                      <img
                        src={getSafeProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        data-category-id={product.category_id}
                        onError={handleImageError}
                      />

                      {product.stock === 0 && (
                        <span className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md">Out of stock</span>
                      )}
                    </Link>

                    <div className="p-3 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <Link to={`/product/${product.id}`} onClick={() => trackProductInteraction(product, 'view')}>
                          <h3 className="font-medium text-slate-200 hover:text-indigo-400 transition-colors line-clamp-2 text-xs leading-tight min-h-[34px]">{product.name}</h3>
                        </Link>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                          {hasDiscount ? (
                            <>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-500 line-through">${originalPrice}</span>
                                <span className="text-[9px] font-bold text-rose-400">-{discountPercent}%</span>
                              </div>
                              <span className="text-sm font-bold text-rose-400">${salePrice}</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-indigo-400">${salePrice}</span>
                          )}
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className="p-1.5 bg-white/10 text-indigo-400 rounded-full hover:bg-indigo-500 hover:text-white transition-colors border border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Add to cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Infinite Scroll Loader */}
          {loadingMore && (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
