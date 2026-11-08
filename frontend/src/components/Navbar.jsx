import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../services/api';
import { trackSearchQuery, trackProductInteraction } from '../utils/userTracker';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Debounce search for suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const results = await apiFetch(`/products?limit=6&offset=0&search=${encodeURIComponent(searchQuery)}`);
        setSuggestions(results || []);
      } catch (error) {
        console.error('Failed to fetch suggestions', error);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      trackSearchQuery(searchQuery.trim());
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/`);
    }
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
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
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">Aurastore</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div ref={dropdownRef} className="hidden md:block flex-1 max-w-md mx-8 relative z-50">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-full bg-white/5 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-white"
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              />
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {loadingSuggestions ? (
                  <div className="p-4 text-center text-sm text-slate-400">Loading...</div>
                ) : suggestions.length > 0 ? (
                  <ul className="max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {suggestions.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setSearchQuery(item.name);
                            setShowSuggestions(false);
                            trackSearchQuery(item.name);
                            trackProductInteraction(item, 'view');
                            navigate(`/?search=${encodeURIComponent(item.name)}`);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0 group"
                        >
                          <Search className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
                          <span className="text-sm text-slate-300 group-hover:text-white truncate transition-colors">{item.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-400">
                    Không tìm thấy kết quả cho "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-xs sm:text-sm font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
                    Admin Panel
                  </Link>
                )}

                {/* Shopee-style User Dropdown (Matches user screenshot 1) */}
                <div 
                  ref={userMenuRef} 
                  className="relative group"
                  onMouseEnter={() => setShowUserDropdown(true)}
                  onMouseLeave={() => setShowUserDropdown(false)}
                >
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 text-sm text-slate-200 font-medium py-1.5 px-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-300 border border-white/20 flex items-center justify-center text-slate-600 overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate text-slate-200 font-medium">
                      {user.username || user.name || (user.email ? user.email.split('@')[0] : '_user')}
                    </span>
                  </button>

                  {/* Dropdown Card */}
                  {showUserDropdown && (
                    <div className="absolute right-0 top-full pt-1.5 z-50">
                      <div className="relative w-44 bg-white text-slate-800 rounded-md shadow-2xl border border-slate-100 py-1.5 animate-in fade-in duration-150">
                        {/* Triangle arrow pointer pointing to avatar */}
                        <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45" />

                        <Link 
                          to="/profile?tab=profile"
                          onClick={() => setShowUserDropdown(false)}
                          className="block px-4 py-2.5 text-sm font-normal text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                        >
                          My Account
                        </Link>
                        <Link 
                          to="/profile?tab=purchase"
                          onClick={() => setShowUserDropdown(false)}
                          className="block px-4 py-2.5 text-sm font-normal text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                        >
                          My Purchase
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm font-normal text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors border-t border-slate-100"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/auth?mode=login" className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Đăng nhập
                </Link>
                <Link to="/auth?mode=signup" className="text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-3.5 py-1.5 rounded-full transition-all shadow-sm shadow-indigo-500/25">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Cart Icon */}
            <Link to="/checkout" className="relative p-2 text-slate-300 hover:text-indigo-400 transition-colors bg-white/5 rounded-full border border-white/10">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-indigo-600 rounded-full border-2 border-[#020204] shadow-sm">
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
