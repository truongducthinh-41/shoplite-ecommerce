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
    <nav className="bg-[#020204]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-[500] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/20">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">ShopLite</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-full bg-white/5 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-white"
              placeholder="Search products..."
            />
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-6">
            
            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-200 font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <User className="h-4 w-4 text-indigo-400" />
                  <span className="hidden sm:inline">{user.name}</span>
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Log in</span>
              </Link>
            )}

            {/* Cart Icon */}
            <Link to="/checkout" className="relative p-2 text-slate-300 hover:text-indigo-400 transition-colors bg-white/5 rounded-full border border-white/10">
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
