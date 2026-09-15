import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, StarHalf } from 'lucide-react';
import VertexHero from '../components/VertexHero';
export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const { addToCart } = useCart();
  const LIMIT = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, bestSellersData] = await Promise.all([
          apiFetch(`/products?limit=${LIMIT}&offset=0`).catch(() => []),
          apiFetch('/products/bestsellers').catch(() => [])
        ]);
        setProducts(productsData || []);
        setBestSellers(bestSellersData || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
  }

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const offset = page * LIMIT;
      const newProducts = await apiFetch(`/products?limit=${LIMIT}&offset=${offset}`);
      if (newProducts && newProducts.length > 0) {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to load more products:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <VertexHero products={products} bestSellers={bestSellers} />
      <div className="mb-12 mt-12"></div>

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Best Sellers</h2>
              <p className="text-sm text-slate-400 mt-1">The most popular products on our market.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {bestSellers.map(product => (
              <div key={product.id} className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all group flex flex-col relative">
                <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full shadow-sm">Hot</span>
                <Link to={`/product/${product.id}`} className="block relative aspect-square bg-white/5">
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
                </Link>
                
                <div className="px-5 pb-5 pt-3 flex flex-col flex-grow">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-white hover:text-indigo-400 transition-colors line-clamp-2 text-sm">{product.name}</h3>
                  </Link>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-lg font-bold text-white">${parseFloat(product.price).toFixed(2)}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="p-2 bg-white/10 text-indigo-400 rounded-full hover:bg-indigo-500 hover:text-white transition-colors border border-transparent"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters (Mock) */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
            <h3 className="font-bold text-white mb-4">Categories</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded bg-white/5 border-white/20 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-[#111]" defaultChecked /> All</label></li>
              <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded bg-white/5 border-white/20 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-[#111]" /> Smartphones</label></li>
              <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded bg-white/5 border-white/20 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-[#111]" /> Laptops</label></li>
              <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded bg-white/5 border-white/20 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-[#111]" /> Audio</label></li>
              <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded bg-white/5 border-white/20 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-[#111]" /> Gaming</label></li>
            </ul>
            <h3 className="font-bold text-white mt-6 mb-4">Availability</h3>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" className="rounded bg-white/5 border-white/20 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-[#111]" defaultChecked /> In Stock Only
            </label>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">All Products</h2>
            <select className="bg-[#111] border border-white/10 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none text-white">
              <option>Sort by Popularity</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length === 0 ? (
               <div className="col-span-full py-12 text-center text-slate-500 bg-[#111] rounded-2xl border border-dashed border-white/20">
                  <p>No products found. Is the backend running?</p>
               </div>
            ) : products.map((product) => (
              <div key={product.id} className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all group flex flex-col">
                <Link to={`/product/${product.id}`} className="block relative aspect-square bg-white/5">
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
                  {product.stock < 10 && product.stock > 0 && (
                    <span className="absolute top-3 left-3 bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-1 rounded-md">Low Stock</span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-3 left-3 bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-1 rounded-md">Out of Stock</span>
                  )}
                </Link>
                
                <div className="px-5 pb-5 pt-3 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold text-white hover:text-indigo-400 transition-colors line-clamp-2 text-sm">{product.name}</h3>
                    </Link>
                  </div>
                  
                  {/* Rating placeholder */}
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <StarHalf className="w-4 h-4 fill-current" />
                    <span className="text-xs text-slate-500 ml-1">(4.5)</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-white">${parseFloat(product.price).toFixed(2)}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="p-2 bg-white/10 text-indigo-400 rounded-full hover:bg-indigo-500 hover:text-white transition-colors border border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:hover:text-indigo-400"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {products.length > 0 && products.length % LIMIT === 0 && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={handleLoadMore} 
                disabled={loadingMore}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] disabled:opacity-50 flex items-center gap-2"
              >
                {loadingMore ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> Loading...</>
                ) : (
                  'Load More Products'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
