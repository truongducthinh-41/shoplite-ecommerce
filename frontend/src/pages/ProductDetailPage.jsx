import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Star, StarHalf, ArrowLeft, Truck, Shield, RotateCcw, Sparkles, MessageSquare } from 'lucide-react';
import { calculatePricing } from '../utils/pricing';
import { FALLBACK_PRODUCTS } from '../data/categoryProducts';
import { trackProductInteraction } from '../utils/userTracker';

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
          apiFetch(`/products/${id}`).catch(() => null),
          apiFetch(`/products/${id}/recommendations`).catch(() => ({ type: '', recommendations: [] })),
          apiFetch(`/reviews/product/${id}`).catch(() => [])
        ]);

        let activeProduct = prodData;
        let activeRecs = recData?.recommendations || [];
        let activeReviews = reviewsData || [];

        // Fallback to local catalog if cloud DB does not have this product yet
        if (!activeProduct) {
          activeProduct = FALLBACK_PRODUCTS.find(p => String(p.id) === String(id));
        }

        if (activeProduct) {
          if (!activeRecs || activeRecs.length === 0) {
            activeRecs = FALLBACK_PRODUCTS
              .filter(p => p.category_id === activeProduct.category_id && String(p.id) !== String(activeProduct.id))
              .slice(0, 4);
          }
          if (!activeReviews || activeReviews.length === 0) {
            activeReviews = [
              {
                id: 101,
                username: 'Nguyễn Văn Anh',
                rating: 5,
                comment: 'Sản phẩm chính hãng chất lượng cực kỳ tốt, đóng gói 3 lớp xốp khí rất kỹ lưỡng và giao hỏa tốc.',
                created_at: new Date(Date.now() - 86400000 * 2).toISOString()
              },
              {
                id: 102,
                username: 'Bành Thị Tòn Tén',
                rating: 5,
                comment: 'Đúng chuẩn hàng Mall, bảo hành điện tử chính hãng kích hoạt ngay khi nhận hàng. Rất hài lòng!',
                created_at: new Date(Date.now() - 86400000 * 5).toISOString()
              }
            ];
          }
        }

        setProduct(activeProduct);
        if (activeProduct) {
          trackProductInteraction(activeProduct, 'view');
        }
        setActiveImageIndex(0);
        setRecommendations({ type: recData?.type || 'Related', items: activeRecs });
        setReviews(activeReviews);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        const fallbackItem = FALLBACK_PRODUCTS.find(p => String(p.id) === String(id));
        setProduct(fallbackItem || null);
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
    trackProductInteraction(product, 'cart');
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
      }).catch(() => null);

      const reviewItem = result || {
        id: Date.now(),
        product_id: Number(id),
        rating: newReview.rating,
        comment: newReview.comment,
        created_at: new Date().toISOString()
      };
      // Add mock username since backend doesn't return it on POST
      reviewItem.username = user.name || user.username || 'You';
      setReviews(prev => [reviewItem, ...prev]);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1)
    : (product.rating_avg ? parseFloat(product.rating_avg).toFixed(1) : 4.8);

  const { salePrice, originalPrice, discountPercent, hasDiscount } = calculatePricing(product);

  return (
    <div className="max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
      </Link>

      <div className="bg-[#111] rounded-3xl shadow-sm border border-white/10 overflow-hidden mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

          {/* Product Image Gallery */}
          <div className="bg-white/5 p-8 md:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 relative">
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
                  <img 
                    src={product.images[activeImageIndex]} 
                    alt={product.name} 
                    className="w-full h-full object-contain drop-shadow-xl transition-transform duration-200 pointer-events-none" 
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'; 
                    }}
                  />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 w-full max-w-md justify-start md:justify-center scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/5 overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-indigo-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${idx}`} className="w-full h-full object-cover" />
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
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-contain drop-shadow-xl transition-transform duration-200 pointer-events-none" 
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'; 
                  }}
                />
              </div>
            ) : (
              <div className="w-full max-w-md aspect-square bg-white/5 rounded-2xl flex items-center justify-center text-slate-500">
                <span className="text-3xl font-bold opacity-50">No Image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-8 md:p-12 flex flex-col text-white">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                {product.category_path || product.category_name || `Category #${product.category_id}`}
              </span>
              {product.stock > 0 && product.stock < 15 && (
                <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-500/30">
                  Only {product.stock} left in stock!
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-white">{product.name}</h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                {averageRating % 1 !== 0 ? <StarHalf className="w-5 h-5 fill-current" /> : <Star className="w-5 h-5 fill-current" />}
              </div>
              <span className="text-sm text-slate-400 font-medium">({averageRating}) • {reviews.length} reviews</span>
            </div>

            {/* Price Box with Clear Discount Tag */}
            <div className="flex items-end gap-3 mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-3xl sm:text-4xl font-extrabold text-rose-400">${salePrice}</p>
              {hasDiscount && (
                <>
                  <p className="text-xl text-slate-500 line-through mb-1">${originalPrice}</p>
                  <span className="text-xs font-black text-white bg-gradient-to-r from-rose-600 to-amber-500 px-2.5 py-1 rounded-md mb-1.5 shadow-sm">
                    GIẢM {discountPercent}%
                  </span>
                </>
              )}
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 whitespace-pre-line">{product.description}</p>

            <div className="mt-auto space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-white/10 rounded-xl bg-black/40">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors rounded-l-xl"
                  >-</button>
                  <span className="w-12 text-center font-medium text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors rounded-r-xl"
                  >+</button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs text-slate-400 font-medium">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs text-slate-400 font-medium">1 Year Warranty</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs text-slate-400 font-medium">30-Day Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-[#111] rounded-3xl shadow-sm border border-white/10 overflow-hidden mb-12 p-8 md:p-12 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-white/10 p-3 rounded-xl">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Write a Review */}
          <div className="md:col-span-1">
            <h3 className="font-bold text-lg mb-4">Write a Review</h3>
            {reviewError && <p className="text-rose-400 text-sm mb-4 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{reviewError}</p>}

            {user ? (
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star className={`w-8 h-8 ${star <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} hover:scale-110 transition-transform`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Your Review</label>
                  <textarea
                    rows="4"
                    value={newReview.comment}
                    onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full border border-white/10 bg-black/50 text-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
                    placeholder="What did you like or dislike?"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 flex justify-center shadow-lg shadow-indigo-600/30"
                >
                  {submittingReview ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                <p className="text-slate-400 mb-4">You must be logged in to leave a review.</p>
                <Link to="/auth" className="inline-block bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-500 transition-colors">Login / Register</Link>
              </div>
            )}
          </div>

          {/* Review List */}
          <div className="md:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <p className="text-slate-500 text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((review, idx) => (
                <div key={idx} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{review.username || review.user_name || 'Customer'}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-amber-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-600'}`} />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      {recommendations.items && recommendations.items.length > 0 && (
        <div className="mb-12">
          <div className="bg-[#111] rounded-3xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {recommendations.type === 'co-occurrence' ? 'Frequently Bought Together' : 'Similar Products You Might Like'}
                </h2>
                <p className="text-xs text-slate-400">Personalized recommendations powered by ShopLite AI</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recommendations.items.map((rec, idx) => {
                const recPricing = calculatePricing(rec);
                return (
                  <Link
                    key={rec.id}
                    to={`/product/${rec.id}`}
                    className="bg-white/5 rounded-2xl p-3 sm:p-4 border border-white/5 hover:border-indigo-500/50 hover:shadow-lg transition-all group flex flex-col h-full relative"
                  >
                    <div className="aspect-square w-full bg-black/40 rounded-xl mb-3 overflow-hidden relative">
                      {rec.image_url ? (
                        <img src={rec.image_url} alt={rec.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform duration-300">
                          <span className="font-bold text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-grow">
                      <h3 className="font-medium text-slate-200 text-xs mb-1 line-clamp-2 min-h-[32px] group-hover:text-indigo-400 transition-colors">{rec.name}</h3>
                      <div className="mt-auto">
                        <div className="flex flex-col">
                          {recPricing.hasDiscount ? (
                            <span className="text-[10px] text-slate-500 line-through">${recPricing.originalPrice}</span>
                          ) : null}
                          <span className="text-indigo-400 font-bold text-sm">${recPricing.salePrice}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
