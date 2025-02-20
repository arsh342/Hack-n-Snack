import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Users, Store, TrendingUp, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { Canteen, Order } from '../types/database';
import { supabase, getOrders } from '../lib/supabase';

const AdminDashboard = () => {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showCanteenModal, setShowCanteenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canteenForm, setCanteenForm] = useState({
    name: '',
    description: '',
    location: '',
    opening_time: '',
    closing_time: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [canteensData, ordersData, usersData] = await Promise.all([
        supabase.from('canteens').select('*'),
        getOrders(),
        supabase.from('users').select('*'),
      ]);

      setCanteens(canteensData.data || []);
      setOrders(ordersData || []);
      setUsers(usersData.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCanteenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('canteens').insert([canteenForm]);
      toast.success('Canteen added successfully');
      setShowCanteenModal(false);
      setCanteenForm({
        name: '',
        description: '',
        location: '',
        opening_time: '',
        closing_time: '',
      });
      loadData();
    } catch (error) {
      toast.error('Failed to add canteen');
    }
  };

  // Calculate statistics
  const calculateStatistics = () => {
    const now = new Date();
    const last30Days = new Date(now.setDate(now.getDate() - 30));

    const recentOrders = orders.filter(order => 
      new Date(order.created_at) > last30Days
    );

    const totalRevenue = recentOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const avgOrderValue = totalRevenue / (recentOrders.length || 1);
    
    const ordersByDay = recentOrders.reduce((acc: { [key: string]: number }, order) => {
      const date = order.created_at.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const ordersPerDay = Object.values(ordersByDay);
    const avgOrdersPerDay = ordersPerDay.reduce((sum, count) => sum + count, 0) / (ordersPerDay.length || 1);

    return {
      totalRevenue,
      avgOrderValue,
      avgOrdersPerDay,
      totalUsers: users.length,
      totalCanteens: canteens.length,
      completionRate: recentOrders.length > 0 
        ? (recentOrders.filter(o => o.status === 'completed').length / recentOrders.length) * 100 
        : 0
    };
  };

  const stats = calculateStatistics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => setShowCanteenModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="mr-2" size={16} />
            Add Canteen
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Revenue (30d)"
            value={`₹${stats.totalRevenue.toFixed(2)}`}
            icon={<TrendingUp className="text-green-600" />}
            trend={10}
          />
          <StatCard
            title="Average Order Value"
            value={`₹${stats.avgOrderValue.toFixed(2)}`}
            icon={<Store className="text-blue-600" />}
            trend={5}
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users className="text-purple-600" />}
            trend={15}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Canteens List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Canteens</h2>
            <div className="space-y-4">
              {canteens.map(canteen => (
                <div key={canteen.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{canteen.name}</h3>
                  <p className="text-gray-600 text-sm">{canteen.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Location: {canteen.location}</p>
                    <p>Hours: {canteen.opening_time} - {canteen.closing_time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <div className="space-y-4">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Order #{order.id.slice(0, 8)}</span>
                    <span className="px-2 py-1 rounded-full text-sm capitalize"
                      style={{
                        backgroundColor: 
                          order.status === 'completed' ? '#D1FAE5' :
                          order.status === 'cancelled' ? '#FEE2E2' :
                          order.status === 'pending' ? '#FEF3C7' : '#DBEAFE',
                        color:
                          order.status === 'completed' ? '#065F46' :
                          order.status === 'cancelled' ? '#991B1B' :
                          order.status === 'pending' ? '#92400E' : '#1E40AF'
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">Amount: ₹{order.total_amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canteen Modal */}
        {showCanteenModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add New Canteen</h2>
              <form onSubmit={handleCanteenSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={canteenForm.name}
                    onChange={(e) => setCanteenForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={canteenForm.description}
                    onChange={(e) => setCanteenForm(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={canteenForm.location}
                    onChange={(e) => setCanteenForm(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Opening Time</label>
                  <input
                    type="time"
                    value={canteenForm.opening_time}
                    onChange={(e) => setCanteenForm(prev => ({ ...prev, opening_time: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Closing Time</label>
                  <input
                    type="time"
                    value={canteenForm.closing_time}
                    onChange={(e) => setCanteenForm(prev => ({ ...prev, closing_time: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCanteenModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Canteen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// StatCard component for displaying statistics
const StatCard = ({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend: number }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
    </div>
    <div className="mt-4 flex items-center">
      {trend > 0 ? (
        <ArrowUpRight className="w-4 h-4 text-green-500" />
      ) : (
        <ArrowDownRight className="w-4 h-4 text-red-500" />
      )}
      <span className={`text-sm ml-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
        {Math.abs(trend)}% from last month
      </span>
    </div>
  </div>
);

export default AdminDashboard;