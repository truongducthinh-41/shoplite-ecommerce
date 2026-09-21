import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, CreditCard, ArrowRight, Truck, CheckCircle, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Cart, 2: Shipping, 3: Payment
  
  // Shipping Form State
  const [shipping, setShipping] = useState({ address: '', city: '', phone: '' });

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleNextStep = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const cartItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      // In a real app, we'd send shipping info too
      await apiFetch('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ cartItems, shipping })
      });

      clearCart();
      setStep(4);
    } catch (err) {
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step !== 4) {
    return (
      <div className="max-w-3xl mx-auto mt-12 text-center p-12 bg-white rounded-3xl shadow-sm border border-slate-200">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-slate-300" />
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
      
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-10 px-4 md:px-12 relative">
        <div className="absolute top-1/2 left-12 right-12 h-1 bg-slate-200 -z-10 -translate-y-1/2"></div>
        <div className={`absolute top-1/2 left-12 h-1 bg-indigo-600 -z-10 -translate-y-1/2 transition-all duration-500`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
        
        <div className={`flex flex-col items-center ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 text-white font-bold transition-colors ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200 text-slate-500'}`}>1</div>
          <span className="text-xs font-bold uppercase tracking-wider">Cart</span>
        </div>
        <div className={`flex flex-col items-center ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 text-white font-bold transition-colors ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200 text-slate-500'}`}>2</div>
          <span className="text-xs font-bold uppercase tracking-wider">Shipping</span>
        </div>
        <div className={`flex flex-col items-center ${step >= 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 text-white font-bold transition-colors ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200 text-slate-500'}`}>3</div>
          <span className="text-xs font-bold uppercase tracking-wider">Payment</span>
        </div>
      </div>
      
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-100 font-medium flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className={`lg:col-span-2 space-y-4 ${step === 4 ? 'lg:col-span-3' : ''}`}>
          
          {step === 4 && (
            <div className="bg-white rounded-3xl shadow-xl shadow-emerald-200/50 border border-slate-200 p-12 text-center transform transition-all animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Payment Successful!</h2>
              <p className="text-slate-500 mb-8 text-lg">Thank you for your purchase. Your order has been placed and is being processed.</p>
              
              <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 flex justify-around text-left">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Date</p>
                  <p className="font-semibold text-slate-900">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Shipping</p>
                  <p className="font-semibold text-slate-900">{shipping.city || 'Standard'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                  <p className="font-semibold text-emerald-600">Processing</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/profile" className="inline-flex items-center justify-center bg-white border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                  View My Orders
                </Link>
                <Link to="/" className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Order Summary ({cart.length} items)</h2>
              </div>
              <ul className="divide-y divide-slate-100">
                {cart.map(item => (
                  <li key={item.id} className="p-6 flex items-center gap-6 group hover:bg-slate-50 transition-colors">
                    {/* Item Image */}
                    <div className="w-24 h-24 bg-white rounded-xl flex-shrink-0 border border-slate-100 p-2 relative overflow-hidden shadow-sm">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
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
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white h-9 shadow-sm">
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
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Truck className="text-indigo-600"/> Shipping Details</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Address</label>
                  <input type="text" value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} className="w-full border border-slate-200 bg-white text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" placeholder="123 Main St, Apt 4B" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                    <input type="text" value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} className="w-full border border-slate-200 bg-white text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" placeholder="New York" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <input type="tel" value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} className="w-full border border-slate-200 bg-white text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" placeholder="(555) 123-4567" />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="text-slate-500 font-medium hover:text-indigo-600 flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> Back to Cart</button>
                <button onClick={() => setStep(3)} disabled={!shipping.address || !shipping.city} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50">Continue to Payment</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><CreditCard className="text-indigo-600"/> Payment Method</h2>
              <div className="p-4 border-2 border-indigo-600 rounded-2xl bg-indigo-50/50 mb-6 flex items-center gap-4 cursor-pointer relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2"><CheckCircle className="w-5 h-5 text-indigo-600"/></div>
                 <div className="w-12 h-8 bg-indigo-600 rounded text-white flex items-center justify-center font-bold text-xs italic">VISA</div>
                 <div>
                   <p className="font-bold text-slate-900">Credit Card</p>
                   <p className="text-xs text-slate-500">**** **** **** 4242</p>
                 </div>
              </div>
              <p className="text-sm text-slate-500 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">This is a mock checkout. No real payment will be processed. By clicking "Complete Purchase", you agree to our Terms of Service.</p>
              
              <div className="flex justify-between items-center">
                 <button onClick={() => setStep(2)} className="text-slate-500 font-medium hover:text-indigo-600 flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> Back to Shipping</button>
                 <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>Complete Purchase</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary sidebar */}
        {step !== 4 && (
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Summary</h2>
            
            <div className="space-y-4 mb-8 text-sm">
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
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-3xl font-extrabold text-indigo-600">${(total * 1.08).toFixed(2)}</span>
              </div>
            </div>

            {step === 1 && (
              <button
                onClick={handleNextStep}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                Checkout <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            
            <p className="text-xs text-slate-500 text-center mt-6 flex items-center justify-center gap-1">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span> 256-bit Secure Encryption
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
