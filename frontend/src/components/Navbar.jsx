import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">ShopLite</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              placeholder="Search products..."
            />
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-6">
            
            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                  <User className="h-4 w-4 text-indigo-600" />
                  <span className="hidden sm:inline">{user.name}</span>
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Log in</span>
              </Link>
            )}

            {/* Cart Icon */}
            <Link to="/checkout" className="relative p-2 text-slate-600 hover:text-indigo-600 transition-colors bg-slate-50 rounded-full border border-slate-200">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-indigo-600 rounded-full border-2 border-white shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
}
