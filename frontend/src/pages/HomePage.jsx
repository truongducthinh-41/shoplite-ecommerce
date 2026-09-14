import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, StarHalf } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, bestSellersData] = await Promise.all([
          apiFetch('/products').catch(() => []),
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

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-indigo-600 rounded-3xl p-8 sm:p-12 mb-12 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">Discover the new standard of e-commerce.</h1>
          <p className="text-indigo-100 text-lg mb-8 max-w-xl">Experience AI-curated recommendations and seamless checkout built for the modern web.</p>
          <button className="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-slate-50 transition-colors shadow-md">
            Shop Now
          </button>
        </div>
      </div>

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Best Sellers</h2>
              <p className="text-sm text-slate-500 mt-1">The most popular products on our market.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {bestSellers.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col relative">
                <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full shadow-sm">Hot</span>
                <Link to={`/product/${product.id}`} className="block relative aspect-square bg-slate-50 p-4">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply" />
                  ) : (
                     <div className="w-full h-full bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-300">
                        <span className="text-xl font-bold opacity-50">No Image</span>
                     </div>
                  )}
                </Link>
                
                <div className="p-5 flex flex-col flex-grow">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 text-sm">{product.name}</h3>
                  </Link>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-lg font-bold text-slate-900">${parseFloat(product.price).toFixed(2)}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-colors"
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Categories</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked /> All</label></li>
              <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /> Smartphones</label></li>
              <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /> Laptops</label></li>
              <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /> Audio</label></li>
              <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /> Gaming</label></li>
            </ul>
            <h3 className="font-bold text-slate-900 mt-6 mb-4">Availability</h3>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked /> In Stock Only
            </label>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">All Products</h2>
            <select className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none shadow-sm">
              <option>Sort by Popularity</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length === 0 ? (
               <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                  <p>No products found. Is the backend running?</p>
               </div>
            ) : products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col">
                <Link to={`/product/${product.id}`} className="block relative aspect-square bg-slate-50 p-6">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply" />
                  ) : (
                     <div className="w-full h-full bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-300">
                        <span className="text-xl font-bold opacity-50">No Image</span>
                     </div>
                  )}
                  {product.stock < 10 && product.stock > 0 && (
                    <span className="absolute top-3 left-3 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-md">Low Stock</span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-3 left-3 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded-md">Out of Stock</span>
                  )}
                </Link>
                
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 text-sm">{product.name}</h3>
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
                    <span className="text-lg font-bold text-slate-900">${parseFloat(product.price).toFixed(2)}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-50 disabled:hover:text-indigo-600"
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
      </div>
    </div>
  );
}
