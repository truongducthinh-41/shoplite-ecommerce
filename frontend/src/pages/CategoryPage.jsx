import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, ChevronRight, Filter, Sparkles, CheckCircle2 } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import { CATEGORY_BRANDS } from './BrandsPage';
import { calculatePricing } from '../utils/pricing';
import { FALLBACK_PRODUCTS } from '../data/categoryProducts';
import { trackCategoryInteraction } from '../utils/userTracker';

// Helper to normalize strings (remove accents, quotes, spaces) for matching
const normalizeStr = (s) => 
  (s || '')
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''’]/g, "")
    .toLowerCase()
    .trim();

// Hierarchy parent-child mapping for high-level category views
const PARENT_CATEGORY_MAP = {
  'Electronics & Technology': ['Smartphones & Accessories', 'Electronics', 'Laptops & Computers', 'Cameras', 'Audio', 'Gaming'],
  'Fashion & Apparel': ["Men's Fashion", "Women's Fashion", "Men's Shoes", "Women's Shoes", "Women's Bags", 'Watches'],
  'Home & Living Ecosystem': ['Home & Living', 'Smart Home & Appliances', 'Pet Supplies'],
  'Beauty & Personal Care': ['Beauty', 'Health', 'Mom & Baby'],
  'Sports, Auto & Lifestyle': ['Sports & Outdoors', 'Automotive', 'Books & Stationery', 'Groceries', 'Gifts', 'Vouchers']
};

// Strict category matcher: prevents "Women's Fashion" from showing inside "Men's Fashion"
const isCategoryMatch = (productCat, selectedCat) => {
  if (!selectedCat || selectedCat === 'All') return true;
  const pNorm = normalizeStr(productCat);
  const sNorm = normalizeStr(selectedCat);

  // 1. Exact match (e.g. "Men's Fashion" === "Men's Fashion")
  if (pNorm === sNorm) return true;

  // 2. Parent category match (only if selectedCat is an explicit parent category)
  for (const [parent, subs] of Object.entries(PARENT_CATEGORY_MAP)) {
    if (normalizeStr(parent) === sNorm) {
      return subs.some(sub => normalizeStr(sub) === pNorm);
    }
  }

  return false;
};

// Sleek Brand Card for Marquee: high-res logo with elegant typography badge fallback
function BrandLogoCard({ brand, isSelected, onClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`flex-shrink-0 w-32 h-20 sm:w-36 sm:h-22 rounded-2xl border transition-all cursor-pointer shadow-lg overflow-hidden p-2.5 flex flex-col items-center justify-center gap-1.5 group select-none ${
        isSelected
          ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/70 shadow-indigo-500/30'
          : 'bg-[#18181c] border-white/10 hover:border-indigo-400 hover:bg-[#22222a]'
      }`}
      title={`Lọc theo thương hiệu: ${brand.name}`}
    >
      <div className="h-9 w-full flex items-center justify-center overflow-hidden">
        {!imgError && brand.url ? (
          <img
            src={brand.url}
            alt={brand.name}
            className="max-h-8 max-w-[85%] object-contain filter brightness-95 contrast-125 group-hover:scale-110 transition-transform duration-200"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-[12px] font-black tracking-widest uppercase text-white font-mono bg-white/10 px-2 py-0.5 rounded border border-white/10 shadow-sm">
            {brand.name}
          </span>
        )}
      </div>
      <span className={`text-[11px] font-semibold tracking-tight truncate max-w-full text-center ${isSelected ? 'text-indigo-300 font-bold' : 'text-slate-300 group-hover:text-white'}`}>
        {brand.name}
      </span>
    </div>
  );
}

export default function CategoryPage() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState('Popularity');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [brandsFilter, setBrandsFilter] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  
  const observer = useRef();
  const { addToCart } = useCart();
  const LIMIT = 100;

  useEffect(() => {
    if (categoryName && categoryName !== 'All') {
      trackCategoryInteraction(categoryName);
    }
  }, [categoryName]);

  // Filter fallback products locally with strict category boundaries
  const getFilteredFallbackProducts = useCallback(() => {
    let list = [...FALLBACK_PRODUCTS];

    // 1. Strict Category Matching (Nam ra nam, Nữ ra nữ, Công nghệ ra công nghệ)
    if (categoryName && categoryName !== 'All') {
      list = list.filter(p => isCategoryMatch(p.category_name, categoryName));
    }

    // 2. Search Query filter
    if (searchQuery) {
      const qNorm = normalizeStr(searchQuery);
      list = list.filter(p => 
        normalizeStr(p.name).includes(qNorm) || 
        normalizeStr(p.description).includes(qNorm) ||
        normalizeStr(p.brand_name).includes(qNorm)
      );
    }

    // 3. Brands filter
    if (brandsFilter && brandsFilter.length > 0) {
      const normBrands = brandsFilter.map(b => normalizeStr(b));
      list = list.filter(p => {
        const pBrandNorm = normalizeStr(p.brand_name);
        const pNameNorm = normalizeStr(p.name);
        return normBrands.some(b => 
          pBrandNorm.includes(b) || b.includes(pBrandNorm) || pNameNorm.includes(b)
        );
      });
    }

    // 4. Min Price filter
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      list = list.filter(p => Number(p.price) >= parseFloat(minPrice));
    }

    // 5. Max Price filter
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      list = list.filter(p => Number(p.price) <= parseFloat(maxPrice));
    }

    // 6. Rating filter
    if (ratingFilter && !isNaN(parseFloat(ratingFilter))) {
      list = list.filter(p => Number(p.rating_avg) >= parseFloat(ratingFilter));
    }

    // 7. Subcategory keyword filter
    if (subCategoryFilter) {
      const subNorm = normalizeStr(subCategoryFilter);
      list = list.filter(p => 
        normalizeStr(p.name).includes(subNorm) || 
        normalizeStr(p.description).includes(subNorm) ||
        normalizeStr(p.category_name).includes(subNorm)
      );
    }

    // 8. Sorting
    if (sort === 'Price: Low to High') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === 'Price: High to Low') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === 'Newest') {
      list.sort((a, b) => Number(b.id) - Number(a.id));
    } else {
      // Default: Popularity
      list.sort((a, b) => Number(b.sold_count || 0) - Number(a.sold_count || 0));
    }

    return list;
  }, [categoryName, searchQuery, brandsFilter, minPrice, maxPrice, ratingFilter, subCategoryFilter, sort]);

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

  // Fetch Initial Data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          limit: LIMIT,
          offset: 0,
          category: categoryName || 'All',
          sort: sort,
          search: searchQuery,
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          ...(brandsFilter.length > 0 && { brands: brandsFilter.join(',') }),
          ...(ratingFilter && { rating: ratingFilter }),
          ...(subCategoryFilter && { subcategory: subCategoryFilter })
        });
        const productsData = await apiFetch(`/products?${queryParams.toString()}`).catch(() => []);
        
        if (productsData && productsData.length > 0) {
          // If remote API returns products, filter out cross-category contaminants if any
          const sanitized = productsData.filter(p => isCategoryMatch(p.category_name, categoryName));
          if (sanitized.length > 0) {
            setProducts(sanitized);
            setHasMore(sanitized.length === LIMIT);
          } else {
            const fallbackList = getFilteredFallbackProducts();
            setProducts(fallbackList);
            setHasMore(false);
          }
        } else {
          // Fallback to local catalog when cloud DB is empty
          const fallbackList = getFilteredFallbackProducts();
          setProducts(fallbackList);
          setHasMore(false);
        }
        setPage(0);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        const fallbackList = getFilteredFallbackProducts();
        setProducts(fallbackList);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [categoryName, sort, searchQuery, minPrice, maxPrice, brandsFilter, ratingFilter, subCategoryFilter, getFilteredFallbackProducts]);

  // Fetch More Data on Page Change
  useEffect(() => {
    if (page === 0) return;
    const loadMore = async () => {
      setLoadingMore(true);
      try {
        const offset = page * LIMIT;
        const queryParams = new URLSearchParams({
          limit: LIMIT,
          offset: offset,
          category: categoryName || 'All',
          sort: sort,
          search: searchQuery,
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          ...(brandsFilter.length > 0 && { brands: brandsFilter.join(',') }),
          ...(ratingFilter && { rating: ratingFilter }),
          ...(subCategoryFilter && { subcategory: subCategoryFilter })
        });
        const newProducts = await apiFetch(`/products?${queryParams.toString()}`).catch(() => []);
        if (newProducts && newProducts.length > 0) {
          const sanitized = newProducts.filter(p => isCategoryMatch(p.category_name, categoryName));
          setProducts(prev => [...prev, ...sanitized]);
          setHasMore(newProducts.length === LIMIT);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Failed to load more products:', error);
        setHasMore(false);
      } finally {
        setLoadingMore(false);
      }
    };
    loadMore();
  }, [page, categoryName]);

  const getBrandsForCategory = () => {
    if (categoryName && CATEGORY_BRANDS[categoryName]) {
      return CATEGORY_BRANDS[categoryName];
    }
    return [
      { name: "Nike", url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
      { name: "Adidas", url: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
      { name: "Apple", url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
      { name: "Samsung", url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
      { name: "Sony", url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg" },
      { name: "Coolmate", url: "https://media3.coolmate.me/cdn-cgi/image/quality=80,format=auto/uploads/January2024/Coolmate-logo-web.png" },
      { name: "Uniqlo", url: "https://upload.wikimedia.org/wikipedia/commons/9/92/UNIQLO_logo.svg" },
      { name: "L'Oréal", url: "https://upload.wikimedia.org/wikipedia/commons/9/9d/L%27Or%C3%A9al_logo.svg" }
    ];
  };

  const brandLogos = getBrandsForCategory();

  const handleClearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setBrandsFilter([]);
    setRatingFilter(null);
    setSubCategoryFilter('');
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8 mt-8">
      {/* Breadcrumb / Title */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link to="/" className="text-slate-400 hover:text-indigo-400 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="text-white font-medium">{categoryName || 'All Categories'}</span>
      </div>

      {/* Top Brands Marquee */}
      <div className="mb-8 bg-[#111] rounded-2xl border border-white/10 p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col relative group/brands">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base sm:text-lg font-bold text-rose-500 uppercase tracking-wider">Top Brands</h2>
          <Link to={`/brands/${encodeURIComponent(categoryName || 'All')}`} className="text-sm text-rose-500 hover:text-rose-400 flex items-center gap-1 font-medium transition-colors">
            See All <ChevronRight className="w-4 h-4"/>
          </Link>
        </div>
        
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex animate-marquee gap-4 py-1">
            {/* First Set */}
            {brandLogos.map((brand, idx) => (
              <BrandLogoCard
                key={idx}
                brand={brand}
                isSelected={brandsFilter.includes(brand.name)}
                onClick={() => setBrandsFilter(prev => prev.includes(brand.name) ? [] : [brand.name])}
              />
            ))}
            {/* Second Set (Duplicate for smooth infinite scroll) */}
            {brandLogos.map((brand, idx) => (
              <BrandLogoCard
                key={`dup-${idx}`}
                brand={brand}
                isSelected={brandsFilter.includes(brand.name)}
                onClick={() => setBrandsFilter(prev => prev.includes(brand.name) ? [] : [brand.name])}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Dynamic Sidebar Filters */}
        <FilterSidebar
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          brandsFilter={brandsFilter}
          setBrandsFilter={setBrandsFilter}
          ratingFilter={ratingFilter}
          setRatingFilter={setRatingFilter}
          subCategoryFilter={subCategoryFilter}
          setSubCategoryFilter={setSubCategoryFilter}
        />

        {/* Product Grid Area */}
        <div className="flex-1">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-[#111] p-4 rounded-xl border border-white/10 shadow-sm">
            <span className="text-sm text-slate-400 font-medium">
              <strong className="text-white font-bold">{products.length}</strong> Products Found
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-black/60 border border-white/15 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Popularity">Popularity (Bán chạy)</option>
                <option value="Price: Low to High">Price: Low to High (Giá tăng dần)</option>
                <option value="Price: High to Low">Price: High to Low (Giá giảm dần)</option>
                <option value="Newest">Newest (Mới nhất)</option>
              </select>
            </div>
          </div>

          <div className="w-full">
            {loading ? (
               <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {products.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400 rounded-2xl border border-dashed border-white/20 p-8 flex flex-col items-center justify-center gap-3 bg-white/[0.02]">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mb-2">
                    <Filter className="w-6 h-6" />
                  </div>
                  <p className="text-base text-slate-200 font-medium">Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại</p>
                  <p className="text-xs text-slate-500 max-w-sm">Thử điều chỉnh lại khoảng giá, bỏ chọn thương hiệu hoặc làm mới bộ lọc.</p>
                  <button
                    onClick={handleClearAllFilters}
                    className="mt-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              ) : products.map((product, index) => {
              const isLast = products.length === index + 1;
              const { salePrice, originalPrice, discountPercent, hasDiscount } = calculatePricing(product);
              return (
              <div ref={isLast ? lastProductElementRef : null} key={product.id} className="bg-[#111] rounded-xl border border-white/10 overflow-hidden hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all group flex flex-col h-full">
                <Link to={`/product/${product.id}`} className="block w-full relative aspect-square bg-white/5 overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'; 
                      }}
                    />
                  ) : (
                     <div className="w-full h-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:scale-105 transition-transform duration-300">
                        <span className="text-xl font-bold opacity-50">No Image</span>
                     </div>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-2 left-2 bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md">Out of stock</span>
                  )}
                </Link>
                
                <div className="p-3 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <Link to={`/product/${product.id}`}>
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
    </div>
  );
}
