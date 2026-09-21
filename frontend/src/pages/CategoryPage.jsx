import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';

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
        const productsData = await apiFetch(`/products?limit=${LIMIT}&offset=0&category=${encodeURIComponent(categoryName || 'All')}&sort=${encodeURIComponent(sort)}&search=${encodeURIComponent(searchQuery)}`).catch(() => []);
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
  }, [categoryName, sort, searchQuery]);

  // Fetch More Data on Page Change
  useEffect(() => {
    if (page === 0) return;
    const loadMore = async () => {
      setLoadingMore(true);
      try {
        const offset = page * LIMIT;
        const newProducts = await apiFetch(`/products?limit=${LIMIT}&offset=${offset}&category=${encodeURIComponent(categoryName || 'All')}&sort=${encodeURIComponent(sort)}&search=${encodeURIComponent(searchQuery)}`);
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

  const fashionBrands = [
    { name: "Nike", url: "https://cdn.simpleicons.org/nike" },
    { name: "Adidas", url: "https://cdn.simpleicons.org/adidas" },
    { name: "Puma", url: "https://cdn.simpleicons.org/puma" },
    { name: "Zara", url: "https://cdn.simpleicons.org/zara" },
    { name: "Uniqlo", url: "https://cdn.simpleicons.org/uniqlo" },
    { name: "Under Armour", url: "https://cdn.simpleicons.org/underarmour" },
    { name: "The North Face", url: "https://cdn.simpleicons.org/thenorthface" },
    { name: "New Balance", url: "https://cdn.simpleicons.org/newbalance" }
  ];

  const techBrands = [
    { name: "Apple", url: "https://cdn.simpleicons.org/apple" },
    { name: "Samsung", url: "https://cdn.simpleicons.org/samsung" },
    { name: "Sony", url: "https://cdn.simpleicons.org/sony" },
    { name: "Dell", url: "https://cdn.simpleicons.org/dell" },
    { name: "Asus", url: "https://cdn.simpleicons.org/asus" },
    { name: "Intel", url: "https://cdn.simpleicons.org/intel" },
    { name: "LG", url: "https://cdn.simpleicons.org/lg" },
    { name: "HP", url: "https://cdn.simpleicons.org/hp" }
  ];

  const generalBrands = [
    { name: "Ikea", url: "https://cdn.simpleicons.org/ikea" },
    { name: "eBay", url: "https://cdn.simpleicons.org/ebay" },
    { name: "Target", url: "https://cdn.simpleicons.org/target" },
    { name: "Starbucks", url: "https://cdn.simpleicons.org/starbucks" },
    { name: "McDonald's", url: "https://cdn.simpleicons.org/mcdonalds" },
    { name: "Shopee", url: "https://cdn.simpleicons.org/shopee" },
    { name: "Visa", url: "https://cdn.simpleicons.org/visa" },
    { name: "Mastercard", url: "https://cdn.simpleicons.org/mastercard" }
  ];

  const getBrandsForCategory = () => {
    const fashionKeywords = ['fashion', 'shoe', 'bag', 'apparel', 'beauty', 'watch'];
    const techKeywords = ['smart', 'phone', 'laptop', 'computer', 'electronic', 'audio', 'gaming', 'camera', 'appliance'];
    
    if (!categoryName) return generalBrands;
    const catLower = categoryName.toLowerCase();
    
    if (fashionKeywords.some(kw => catLower.includes(kw))) return fashionBrands;
    if (techKeywords.some(kw => catLower.includes(kw))) return techBrands;
    return generalBrands;
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
          <Link to="#" className="text-sm text-rose-500 hover:text-rose-400 flex items-center gap-1">See All <ChevronRight className="w-4 h-4"/></Link>
        </div>
        
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex animate-marquee gap-4">
            {/* First Set */}
            {brandLogos.map((brand, idx) => (
              <div key={idx} className="flex-shrink-0 w-28 h-16 sm:w-32 sm:h-20 flex items-center justify-center bg-white rounded-xl border border-white/5 hover:border-indigo-500 transition-all cursor-pointer shadow-md overflow-hidden p-2">
                <img src={brand.url} alt={brand.name} className="max-w-full max-h-full object-contain filter hover:scale-110 transition-transform" />
              </div>
            ))}
            {/* Second Set (Duplicate for smooth infinite scroll) */}
            {brandLogos.map((brand, idx) => (
              <div key={`dup-${idx}`} className="flex-shrink-0 w-28 h-16 sm:w-32 sm:h-20 flex items-center justify-center bg-white rounded-xl border border-white/5 hover:border-indigo-500 transition-all cursor-pointer shadow-md overflow-hidden p-2">
                <img src={brand.url} alt={brand.name} className="max-w-full max-h-full object-contain filter hover:scale-110 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar + Main Content Flex */}
      <div className="flex flex-col md:flex-row gap-6 mb-12">
        
        {/* Sidebar (Filters) */}
        <div className="w-full md:w-64 shrink-0">
           <FilterSidebar />
        </div>
        
        {/* Main Product Grid */}
        <div className="flex-1">
          {searchQuery ? (
            <h2 className="text-xl font-bold text-indigo-400 uppercase tracking-wider mb-6">
              Search Results for "{searchQuery}" in {categoryName}
            </h2>
          ) : (
            <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6">
              {categoryName} Products
            </h2>
          )}

          {/* Sorting Bar */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-3 flex flex-wrap items-center gap-3 md:gap-4 mb-6 shadow-sm">
            <span className="text-slate-400 text-sm hidden sm:inline-block font-medium">Sort by</span>
            <button className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-indigo-500 transition-colors">Popular</button>
            <button className="px-4 py-1.5 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white text-sm font-medium rounded-lg transition-colors border border-transparent">Latest</button>
            <button className="px-4 py-1.5 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white text-sm font-medium rounded-lg transition-colors border border-transparent">Top Sales</button>
            <div className="relative flex-1 max-w-[150px] sm:ml-auto">
              <select className="w-full px-4 py-1.5 bg-white/5 text-slate-300 border border-white/10 hover:border-white/20 text-sm font-medium rounded-lg transition-colors outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                <option value="price" className="bg-[#111]">Price</option>
                <option value="asc" className="bg-[#111]">Low to High</option>
                <option value="desc" className="bg-[#111]">High to Low</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              const discount = (product.id % 40) + 10;
              const salePrice = parseFloat(product.price).toFixed(2);
              const originalPrice = (parseFloat(product.price) / (1 - discount/100)).toFixed(2);
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
                  {/* Shopee-style discount badge */}
                  <div className="absolute top-0 right-0 bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-1 rounded-bl-lg">
                    -{discount}%
                  </div>
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
                      <span className="text-xs text-slate-500 line-through">${originalPrice}</span>
                      <span className="text-sm font-bold text-indigo-400">${salePrice}</span>
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
