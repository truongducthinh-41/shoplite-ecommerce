import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, Smartphone, Laptop, Headphones, Gamepad, Watch, Camera, Flame, Shirt, ShoppingBag, Baby, Monitor, Home, Sparkles, HeartPulse, Footprints, Briefcase, Coffee, Dumbbell, Store, Car, Book, Gamepad2, Gift, Box, Ticket, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import VertexHero from '../components/VertexHero';

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
  const observer = useRef();
  const { addToCart } = useCart();
  const LIMIT = 100; // Increased limit for Gợi ý hôm nay

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
        const [productsData, bestSellersData] = await Promise.all([
          apiFetch(`/products?limit=${LIMIT}&offset=0&category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}&search=${encodeURIComponent(searchQuery)}`).catch(() => []),
          apiFetch('/products/bestsellers').catch(() => [])
        ]);
        setProducts(productsData || []);
        setBestSellers(bestSellersData || []);
        setPage(0);
        setHasMore(productsData?.length === LIMIT);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
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
        const newProducts = await apiFetch(`/products?limit=${LIMIT}&offset=${offset}&category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}&search=${encodeURIComponent(searchQuery)}`);
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

  const categoryIcons = [
    { name: "Men's Fashion", icon: Shirt },
    { name: "Women's Fashion", icon: ShoppingBag },
    { name: 'Smartphones & Accessories', icon: Smartphone },
    { name: 'Mom & Baby', icon: Baby },
    { name: 'Electronics', icon: Monitor },
    { name: 'Home & Living', icon: Home },
    { name: 'Laptops & Computers', icon: Laptop },
    { name: 'Beauty', icon: Sparkles },
    { name: 'Cameras', icon: Camera },
    { name: 'Health', icon: HeartPulse },
    { name: 'Watches', icon: Watch },
    { name: "Women's Shoes", icon: Footprints },
    { name: "Men's Shoes", icon: Footprints },
    { name: "Women's Bags", icon: Briefcase },
    { name: 'Smart Home & Appliances', icon: Coffee },
    { name: 'Audio', icon: Headphones },
    { name: 'Sports & Outdoors', icon: Dumbbell },
    { name: 'Groceries', icon: Store },
    { name: 'Automotive', icon: Car },
    { name: 'Books & Stationery', icon: Book },
    { name: 'Gaming', icon: Gamepad2 },
    { name: 'Pet Supplies', icon: Box },
    { name: 'Gifts', icon: Gift },
    { name: 'Vouchers', icon: Ticket },
  ];
  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Banner (3D Effect) */}
      <VertexHero products={products} bestSellers={bestSellers} />
      <div className="mb-12 mt-12"></div>

      {/* Categories Section (Danh Mục) */}
      <div className="mb-8 bg-[#111] rounded-2xl border border-white/10 p-4 sm:p-6 shadow-sm relative group/cats">
        <h2 className="text-base sm:text-lg font-bold text-white mb-0 uppercase tracking-wider">Categories</h2>

        <div 
          ref={scrollContainerRef}
          className="grid grid-rows-2 auto-cols-[80px] sm:auto-cols-[90px] grid-flow-col overflow-x-auto gap-y-3 gap-x-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-4 -mx-2 px-2 sm:-mx-4 sm:px-4 snap-x"
        >
          {categoryIcons.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`)}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all snap-start bg-white/5 border-transparent text-slate-400 hover:bg-indigo-500/20 hover:border-indigo-500 hover:text-indigo-400 hover:scale-105 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)]`}
            >
              <cat.icon className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-[10px] font-semibold text-center leading-tight line-clamp-2">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Best Sellers / Top Searches (Tìm Kiếm Hàng Đầu) */}
      {bestSellers.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6 text-amber-500">
            <Flame className="w-6 h-6 fill-current" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white">Top Searches</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map(product => {
              const discount = (product.id % 40) + 10;
              const salePrice = parseFloat(product.price).toFixed(2);
              const originalPrice = (parseFloat(product.price) / (1 - discount/100)).toFixed(2);
              return (
              <div key={product.id} className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all group flex flex-col relative h-full">
                <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-[10px] sm:text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full shadow-sm">TOP</span>
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
                        <span className="text-xs font-bold opacity-50">No Image</span>
                     </div>
                  )}
                </Link>
                
                <div className="px-4 pb-4 pt-3 flex flex-col flex-grow">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-white hover:text-indigo-400 transition-colors line-clamp-2 text-sm min-h-[40px]">{product.name}</h3>
                  </Link>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 line-through">${originalPrice}</span>
                      <span className="text-base sm:text-lg font-bold text-indigo-400">${salePrice}</span>
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

      {/* Daily Discoveries / Search Results (Gợi Ý Hôm Nay) */}
      <div className="mb-12">
        {searchQuery ? (
          <h2 className="text-xl font-bold text-indigo-400 uppercase tracking-wider text-center mb-8">
            Search Results for "{searchQuery}"
          </h2>
        ) : (
          <h2 className="text-xl font-bold text-indigo-400 uppercase tracking-wider text-center mb-8">
            Daily Discoveries
          </h2>
        )}

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
  );
}
