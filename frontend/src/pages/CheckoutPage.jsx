import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, CreditCard, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (cart.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const items = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      await apiFetch('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ items })
      });

      clearCart();
      alert('Order placed successfully!');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto mt-12 text-center p-12 bg-white rounded-3xl shadow-sm border border-slate-200">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">Looks like you haven't added any items to your cart yet.</p>
        <Link to="/" className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Checkout</h1>
      
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-100 font-medium">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Order Summary ({cart.length} items)</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {cart.map(item => (
                <li key={item.id} className="p-6 flex items-center gap-6">
                  {/* Item Image */}
                  <div className="w-24 h-24 bg-slate-50 rounded-xl flex-shrink-0 border border-slate-100 p-2 relative overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <span className="text-xs font-bold">No IMG</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.id}`} className="block font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate mb-1">
                      {item.name}
                    </Link>
                    <p className="text-indigo-600 font-bold mb-4">${parseFloat(item.price).toFixed(2)}</p>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white h-9">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-l-lg transition-colors"
                        >-</button>
                        <span className="w-10 text-center font-medium text-slate-900 text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-r-lg transition-colors"
                        >+</button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Payment Details</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-medium text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (estimated)</span>
                <span className="font-medium text-slate-900">${(total * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-2xl font-extrabold text-indigo-600">${(total * 1.08).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  {user ? 'Complete Purchase' : 'Login to Checkout'}
                  <ArrowRight className="w-5 h-5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </>
              )}
            </button>
            
            <p className="text-xs text-slate-500 text-center mt-4 flex items-center justify-center gap-1">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span> Secure encrypted checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
