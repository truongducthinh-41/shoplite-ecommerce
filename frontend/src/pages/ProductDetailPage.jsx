import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Star, StarHalf, ArrowLeft, Truck, Shield, RotateCcw, Sparkles, MessageSquare } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState({ type: '', items: [] });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const [prodData, recData, reviewsData] = await Promise.all([
          apiFetch(`/products/${id}`),
          apiFetch(`/products/${id}/recommendations`).catch(() => ({ type: '', recommendations: [] })),
          apiFetch(`/reviews/product/${id}`).catch(() => [])
        ]);
        setProduct(prodData);
        setActiveImageIndex(0);
        setRecommendations({ type: recData.type, items: recData.recommendations || [] });
        setReviews(reviewsData || []);
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

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewError('You must be logged in to leave a review.');
      return;
    }
    if (!newReview.comment.trim()) {
      setReviewError('Please write a comment.');
      return;
    }
    
    setSubmittingReview(true);
    setReviewError('');
    try {
      const result = await apiFetch(`/reviews/product/${id}`, {
        method: 'POST',
        body: JSON.stringify(newReview)
      });
      // Add mock username since backend doesn't return it on POST
      result.username = user.name || user.username || 'You';
      setReviews(prev => [result, ...prev]);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1)
    : 4.5;

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
                <div 
                  className="w-full mb-6 flex-grow flex items-center justify-center h-64 md:h-80 overflow-hidden cursor-zoom-in relative"
                  onMouseMove={(e) => {
                    const img = e.currentTarget.querySelector('img');
                    if (!img) return;
                    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - left) / width) * 100;
                    const y = ((e.clientY - top) / height) * 100;
                    img.style.transformOrigin = `${x}% ${y}%`;
                  }}
                  onMouseEnter={(e) => {
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(2)';
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget.querySelector('img');
                    if (img) {
                      img.style.transform = 'scale(1)';
                      img.style.transformOrigin = 'center center';
                    }
                  }}
                >
                  <img src={product.images[activeImageIndex]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl transition-transform duration-200 pointer-events-none" />
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
                <div 
                  className="w-full max-w-md h-auto overflow-hidden cursor-zoom-in"
                  onMouseMove={(e) => {
                    const img = e.currentTarget.querySelector('img');
                    if (!img) return;
                    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - left) / width) * 100;
                    const y = ((e.clientY - top) / height) * 100;
                    img.style.transformOrigin = `${x}% ${y}%`;
                  }}
                  onMouseEnter={(e) => {
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(2)';
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget.querySelector('img');
                    if (img) {
                      img.style.transform = 'scale(1)';
                      img.style.transformOrigin = 'center center';
                    }
                  }}
                >
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl transition-transform duration-200 pointer-events-none" />
                </div>
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
                {averageRating % 1 !== 0 ? <StarHalf className="w-5 h-5 fill-current" /> : <Star className="w-5 h-5 fill-current" />}
              </div>
              <span className="text-sm text-slate-500 font-medium">({averageRating}) • {reviews.length} reviews</span>
            </div>

            {(() => {
              const discount = (product.id % 40) + 10;
              const salePrice = parseFloat(product.price).toFixed(2);
              const originalPrice = (parseFloat(product.price) / (1 - discount/100)).toFixed(2);
              return (
                <div className="flex items-end gap-3 mb-6">
                  <p className="text-3xl font-bold text-slate-900">${salePrice}</p>
                  <p className="text-xl text-slate-400 line-through mb-1">${originalPrice}</p>
                  <span className="text-sm font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md mb-1.5">-{discount}%</span>
                </div>
              );
            })()}
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

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-12 p-8 md:p-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-slate-100 p-3 rounded-xl">
            <MessageSquare className="w-6 h-6 text-slate-900" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Reviews</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Write a Review */}
          <div className="md:col-span-1">
            <h3 className="font-bold text-lg mb-4">Write a Review</h3>
            {reviewError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{reviewError}</p>}
            
            {user ? (
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        type="button" 
                        key={star} 
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="focus:outline-none"
                      >
                        <Star className={`w-8 h-8 ${star <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} hover:scale-110 transition-transform`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Your Review</label>
                  <textarea 
                    rows="4" 
                    value={newReview.comment}
                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                    className="w-full border border-slate-200 bg-white text-slate-900 rounded-xl p-3 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none transition-all"
                    placeholder="What did you like or dislike?"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={submittingReview}
                  className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 flex justify-center"
                >
                  {submittingReview ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                <p className="text-slate-600 mb-4">You must be logged in to leave a review.</p>
                <Link to="/auth" className="inline-block bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">Login / Register</Link>
              </div>
            )}
          </div>

          {/* Review List */}
          <div className="md:col-span-2 space-y-6">
            {reviews.length === 0 ? (
               <p className="text-slate-500 text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((review, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">{review.username}</span>
                    <span className="text-sm text-slate-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendation Widget */}
      {recommendations.items.length > 0 && (
        <div className="mb-12 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl -z-10 transform scale-[1.01] group-hover:scale-[1.02] transition-transform duration-500"></div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg animate-pulse">
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
              {recommendations.items.map((rec, idx) => (
                <Link 
                  key={rec.id} 
                  to={`/product/${rec.id}`} 
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-lg hover:border-indigo-300 transition-all group flex flex-col h-full transform hover:-translate-y-1"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
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
                      {(() => {
                        const discount = (rec.id % 40) + 10;
                        const salePrice = parseFloat(rec.price).toFixed(2);
                        const originalPrice = (parseFloat(rec.price) / (1 - discount/100)).toFixed(2);
                        return (
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400 line-through">${originalPrice}</span>
                            <span className="text-indigo-600 font-bold">${salePrice}</span>
                          </div>
                        );
                      })()}
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
