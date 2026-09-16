import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, StarHalf, ArrowLeft, Truck, Shield, RotateCcw, Sparkles } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState({ type: '', items: [] });
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const [prodData, recData] = await Promise.all([
          apiFetch(`/products/${id}`),
          apiFetch(`/products/${id}/recommendations`).catch(() => ({ type: '', recommendations: [] }))
        ]);
        setProduct(prodData);
        setActiveImageIndex(0);
        setRecommendations({ type: recData.type, items: recData.recommendations || [] });
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
  }

  if (!product) {
    return <div className="text-center py-12 text-slate-500">Product not found.</div>;
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          
          {/* Product Image Gallery */}
          <div className="bg-slate-50 p-8 md:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
            {product.images && product.images.length > 0 ? (
              <>
                <div className="w-full mb-6 flex-grow flex items-center justify-center h-64 md:h-80">
                  <img src={product.images[activeImageIndex]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl transition-all duration-300" />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 w-full max-w-md justify-start md:justify-center scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-indigo-600 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${idx}`} className="w-full h-full object-cover mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              </>
            ) : product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full max-w-md h-auto object-contain mix-blend-multiply drop-shadow-xl" />
            ) : (
              <div className="w-full max-w-md aspect-square bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                <span className="text-3xl font-bold opacity-50">No Image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-8 md:p-12 flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Category ID: {product.category_id}</span>
              {product.stock > 0 && product.stock < 10 && (
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md">Only {product.stock} left!</span>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <StarHalf className="w-5 h-5 fill-current" />
              </div>
              <span className="text-sm text-slate-500">(128 reviews)</span>
            </div>

            <p className="text-3xl font-bold text-slate-900 mb-6">${parseFloat(product.price).toFixed(2)}</p>
            
            <p className="text-slate-600 text-base leading-relaxed mb-8 whitespace-pre-line">{product.description}</p>

            <div className="mt-auto space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                  >-</button>
                  <span className="w-12 text-center font-medium text-slate-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-3 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                  >+</button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="w-6 h-6 text-indigo-600" />
                  <span className="text-xs text-slate-500 font-medium">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield className="w-6 h-6 text-indigo-600" />
                  <span className="text-xs text-slate-500 font-medium">1 Year Warranty</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw className="w-6 h-6 text-indigo-600" />
                  <span className="text-xs text-slate-500 font-medium">30-Day Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Widget */}
      {recommendations.items.length > 0 && (
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl -z-10 transform scale-[1.02]"></div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {recommendations.type === 'co-occurrence' ? 'Frequently Bought Together' : 'Similar Products You Might Like'}
                </h2>
                <p className="text-sm text-indigo-600 font-medium mt-1">AI-powered recommendation</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recommendations.items.map(rec => (
                <Link key={rec.id} to={`/product/${rec.id}`} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col h-full">
                  <div className="aspect-square w-full bg-slate-50 rounded-xl mb-4 overflow-hidden relative">
                    {rec.image_url ? (
                      <img src={rec.image_url} alt={rec.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300 mix-blend-multiply" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform duration-300">
                        <span className="font-bold text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h3 className="font-medium text-slate-900 text-sm mb-1 line-clamp-2 min-h-[40px] group-hover:text-indigo-600 transition-colors">{rec.name}</h3>
                    <div className="mt-auto">
                      <p className="text-indigo-600 font-bold">${parseFloat(rec.price).toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
