import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { BarChart3, Package, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState({ salesSummary: [], lowStockProducts: [], kpi: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const data = await apiFetch('/admin/dashboard');
        setDashboardData(data);
      } catch (err) {
        setError('Failed to load admin data. Are you an admin?');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
     return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-12 bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto mt-12">{error}</div>;
  }

  const { salesSummary = [], kpi = {} } = dashboardData;
  const totalRevenue = kpi.totalRevenue || 0;
  const totalOrders = kpi.totalOrders || 0;
  const totalUsers = kpi.totalUsers || 0;
  const aov = kpi.aov || 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of your store's performance.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          Download Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-400">Total Revenue</h3>
            <div className="p-2 bg-indigo-500/20 rounded-lg"><DollarSign className="w-5 h-5 text-indigo-400" /></div>
          </div>
          <p className="text-3xl font-extrabold text-white">${parseFloat(totalRevenue).toFixed(2)}</p>
          <p className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12.5% from last week
          </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-400">Total Orders</h3>
            <div className="p-2 bg-blue-500/20 rounded-lg"><Package className="w-5 h-5 text-blue-400" /></div>
          </div>
          <p className="text-3xl font-extrabold text-white">{totalOrders}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-400">Active Users</h3>
            <div className="p-2 bg-purple-500/20 rounded-lg"><Users className="w-5 h-5 text-purple-400" /></div>
          </div>
          <p className="text-3xl font-extrabold text-white">{totalUsers}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-400">Avg. Order Value</h3>
            <div className="p-2 bg-amber-500/20 rounded-lg"><BarChart3 className="w-5 h-5 text-amber-400" /></div>
          </div>
          <p className="text-3xl font-extrabold text-white">${parseFloat(aov).toFixed(2)}</p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Recent Sales History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-white/10">Date</th>
                <th className="p-4 font-semibold border-b border-white/10 text-center">Orders</th>
                <th className="p-4 font-semibold border-b border-white/10 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {salesSummary.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-400">No sales data available.</td>
                </tr>
              ) : (
                salesSummary.map((day, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-sm font-medium text-white">
                      {new Date(day.sale_date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-slate-300 text-center">{day.total_orders}</td>
                    <td className="p-4 text-sm font-bold text-indigo-400 text-right">
                      ${parseFloat(day.daily_revenue).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
