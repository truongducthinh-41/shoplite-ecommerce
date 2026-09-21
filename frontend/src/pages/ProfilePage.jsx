import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { User, Package, Settings, LogOut, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await apiFetch('/orders/myorders');
        setOrders(data || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto relative z-10">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl mb-4">
                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
              </div>
              <h2 className="font-bold text-slate-900">{user.name || user.username}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <div className="p-2">
              <button 
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Package className="w-5 h-5" /> Order History
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <User className="w-5 h-5" /> Personal Info
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Settings className="w-5 h-5" /> Settings
              </button>
              <div className="my-2 border-t border-slate-100"></div>
              <button 
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><FileText className="text-indigo-600" /> Order History</h2>
              
              {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-500 font-medium">Order #{order.id}</p>
                          <p className="text-sm font-bold text-slate-900">{new Date(order.order_date).toLocaleDateString()} {new Date(order.order_date).toLocaleTimeString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500 font-medium">Total Amount</p>
                          <p className="text-lg font-bold text-indigo-600">${parseFloat(order.total_amount).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                          {order.status || 'Processing'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h2>
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input type="text" value={user.name || user.username || ''} readOnly className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input type="email" value={user.email || ''} readOnly className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <input type="text" value={user.role || 'Customer'} readOnly className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-500 focus:outline-none capitalize" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Account Settings</h2>
              <p className="text-slate-500">Settings panel is under construction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
