import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import { CATEGORY_BRANDS } from './BrandsPage';
import { calculatePricing } from '../utils/pricing';

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
        setProducts(productsData || []);
        setPage(0);
        setHasMore(productsData?.length === LIMIT);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [categoryName, sort, searchQuery, minPrice, maxPrice, brandsFilter, ratingFilter, subCategoryFilter]);

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
        const newProducts = await apiFetch(`/products?${queryParams.toString()}`);
        if (newProducts && newProducts.length > 0) {
          setProducts(prev => [...prev, ...newProducts]);
          setHasMore(newProducts.length === LIMIT);
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

  const getBrandsForCategory = () => {
    if (categoryName && CATEGORY_BRANDS[categoryName]) {
      return CATEGORY_BRANDS[categoryName].slice(0, 15);
    }
    // Fallback to random popular brands if category not specifically mapped
    return [
      { name: "Apple", url: "https://cdn.simpleicons.org/apple/white" },
      { name: "Nike", url: "https://cdn.simpleicons.org/nike/white" },
      { name: "Samsung", url: "https://cdn.simpleicons.org/samsung/white" },
      { name: "Zara", url: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg" },
      { name: "Sony", url: "https://cdn.simpleicons.org/sony/white" },
      { name: "Gucci", url: "https://cdn.simpleicons.org/gucci/white" },
      { name: "Dell", url: "https://cdn.simpleicons.org/dell/white" },
      { name: "L'Oréal", url: "https://upload.wikimedia.org/wikipedia/commons/9/9d/L%27Or%C3%A9al_logo.svg" }
    ];
  };

  const brandLogos = getBrandsForCategory();

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8 mt-8">
      {/* Breadcrumb / Title */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link to="/" className="text-slate-400 hover:text-indigo-400">Home</Link>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="text-white font-medium">{categoryName || 'All Categories'}</span>
      </div>

      {/* Top Brands Marquee */}
      <div className="mb-8 bg-[#111] rounded-2xl border border-white/10 p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col relative group/brands">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base sm:text-lg font-bold text-rose-500 uppercase tracking-wider">Top Brands</h2>
          <Link to={`/brands/${encodeURIComponent(categoryName || 'All')}`} className="text-sm text-rose-500 hover:text-rose-400 flex items-center gap-1">See All <ChevronRight className="w-4 h-4"/></Link>
        </div>
        
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex animate-marquee gap-4">
            {/* First Set */}
            {brandLogos.map((brand, idx) => (
              <div 
                key={idx} 
                onClick={() => setBrandsFilter(prev => prev.includes(brand.name) ? [] : [brand.name])}
                className={`flex-shrink-0 w-28 h-16 sm:w-32 sm:h-20 flex items-center justify-center bg-white rounded-xl border transition-all cursor-pointer shadow-md overflow-hidden p-2 ${
                  brandsFilter.includes(brand.name) ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-white/5 hover:border-indigo-500'
                }`}
                title={`Lọc theo thương hiệu: ${brand.name}`}
              >
                <img 
                  src={brand.url} 
                  alt={brand.name} 
                  className="max-w-full max-h-full object-contain filter hover:scale-110 transition-transform" 
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/222222/FFFFFF?text=' + encodeURIComponent(brand.name.charAt(0)) }}
                />
              </div>
            ))}
            {/* Second Set (Duplicate for smooth infinite scroll) */}
            {brandLogos.map((brand, idx) => (
              <div 
                key={`dup-${idx}`} 
                onClick={() => setBrandsFilter(prev => prev.includes(brand.name) ? [] : [brand.name])}
                className={`flex-shrink-0 w-28 h-16 sm:w-32 sm:h-20 flex items-center justify-center bg-white rounded-xl border transition-all cursor-pointer shadow-md overflow-hidden p-2 ${
                  brandsFilter.includes(brand.name) ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-white/5 hover:border-indigo-500'
                }`}
                title={`Lọc theo thương hiệu: ${brand.name}`}
              >
                <img 
                  src={brand.url} 
                  alt={brand.name} 
                  className="max-w-full max-h-full object-contain filter hover:scale-110 transition-transform" 
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/222222/FFFFFF?text=' + encodeURIComponent(brand.name.charAt(0)) }}
                />
              </div>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-[#111] p-4 rounded-xl border border-white/10">
            <span className="text-sm text-slate-400 font-medium">{products.length} Products Found</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-black/50 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
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
               <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {products.length === 0 ? (
               <div className="col-span-full py-12 text-center text-slate-500 rounded-2xl border border-dashed border-white/20">
                  <p>No products found in this category.</p>
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
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/1a1a1a/444?text=No+Image' }}
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
