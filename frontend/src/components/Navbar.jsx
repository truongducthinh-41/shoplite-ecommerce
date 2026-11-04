import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const dropdownRef = useRef(null);

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

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/`);
    }
  };

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
              <div className="w-8 h-8 bg-[#EE4D2D] rounded-lg flex items-center justify-center shadow-sm shadow-orange-500/20">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">ShopLite</span>
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
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-full bg-white/5 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm text-white"
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
                            navigate(`/?search=${encodeURIComponent(item.name)}`);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0 group"
                        >
                          <Search className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors shrink-0" />
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
                {user.role === 'seller' && (
                  <Link to="/profile" className="text-xs sm:text-sm font-semibold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 hover:bg-orange-500/20 transition-colors hidden md:inline-flex">
                    🏬 {user.shop ? user.shop.name : 'Kênh Người Bán'}
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 text-sm text-slate-200 font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                  <User className="h-4 w-4 text-orange-400" />
                  <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                </Link>
                <button onClick={handleLogout} title="Đăng xuất" className="text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/auth?mode=login" className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Đăng nhập
                </Link>
                <Link to="/auth?mode=signup" className="text-xs font-bold text-white bg-[#EE4D2D] hover:bg-[#d73211] px-3.5 py-1.5 rounded-full transition-all shadow-sm shadow-orange-500/20">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Cart Icon */}
            <Link to="/checkout" className="relative p-2 text-slate-300 hover:text-orange-400 transition-colors bg-white/5 rounded-full border border-white/10">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-[#EE4D2D] rounded-full border-2 border-white shadow-sm">
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
