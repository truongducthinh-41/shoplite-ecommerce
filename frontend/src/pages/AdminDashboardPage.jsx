import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { BarChart3, Package, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const data = await apiFetch('/admin/sales');
        setSalesData(data);
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

  const totalRevenue = salesData.reduce((sum, day) => sum + parseFloat(day.daily_revenue), 0);
  const totalOrders = salesData.reduce((sum, day) => sum + parseInt(day.total_orders), 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your store's performance.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          Download Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Total Revenue</h3>
            <div className="p-2 bg-indigo-50 rounded-lg"><DollarSign className="w-5 h-5 text-indigo-600" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12.5% from last week
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Total Orders</h3>
            <div className="p-2 bg-blue-50 rounded-lg"><Package className="w-5 h-5 text-blue-600" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{totalOrders}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Active Users</h3>
            <div className="p-2 bg-purple-50 rounded-lg"><Users className="w-5 h-5 text-purple-600" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">1,240</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Conversion Rate</h3>
            <div className="p-2 bg-amber-50 rounded-lg"><BarChart3 className="w-5 h-5 text-amber-600" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">3.8%</p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Recent Sales History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-slate-200">Date</th>
                <th className="p-4 font-semibold border-b border-slate-200 text-center">Orders</th>
                <th className="p-4 font-semibold border-b border-slate-200 text-center">Items Sold</th>
                <th className="p-4 font-semibold border-b border-slate-200 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No sales data available.</td>
                </tr>
              ) : (
                salesData.map((day, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-slate-900">
                      {new Date(day.sale_date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-slate-600 text-center">{day.total_orders}</td>
                    <td className="p-4 text-sm text-slate-600 text-center">{day.items_sold}</td>
                    <td className="p-4 text-sm font-bold text-indigo-600 text-right">
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
