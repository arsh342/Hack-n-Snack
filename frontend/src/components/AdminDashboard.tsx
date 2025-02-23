import React from 'react';
import Layout from './layout/Layout';
import { Users, Bell, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database'; // Import Database type

// Define minimal User type (adjust based on your Supabase users table)
interface User {
  id: string;
  email: string;
  role?: string; // Optional, adjust as per your schema
}

// Use Database types for Canteen and Order
type Canteen = Database['public']['Tables']['canteens']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

const AdminDashboard = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [canteens, setCanteens] = React.useState<Canteen[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [selectedSection, setSelectedSection] = React.useState('users');

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: usersData } = await supabase
        .from('users')
        .select('*');
      setUsers(usersData || []);

      const { data: canteensData } = await supabase
        .from('canteens')
        .select('*');
      setCanteens(canteensData || []);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*');
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Calculate statistics
  const totalUsers = users.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const totalOrders = orders.length;
  const activeCanteens = canteens.filter(canteen => canteen.status === 'active').length;

  const renderStats = () => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Users
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {totalUsers}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Store className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Canteens
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {activeCanteens}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Store className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Orders
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {totalOrders}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Bell className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Revenue
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  ${totalRevenue.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'users':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">User Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role || 'N/A'} {/* Handle optional role */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'canteens':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Canteen Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {canteens.map((canteen) => (
                    <tr key={canteen.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {canteen.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {canteen.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderStats()}
          <div className="flex flex-col md:flex-row md:space-x-6">
            <div className="w-full md:w-64 mb-6 md:mb-0">
              <nav className="space-y-1">
                <button
                  onClick={() => setSelectedSection('users')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    selectedSection === 'users'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Users className="mr-3 h-5 w-5" />
                  User Management
                </button>
                <button
                  onClick={() => setSelectedSection('canteens')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    selectedSection === 'canteens'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Store className="mr-3 h-5 w-5" />
                  Canteen Management
                </button>
                <button
                  onClick={() => setSelectedSection('notifications')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    selectedSection === 'notifications'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Bell className="mr-3 h-5 w-5" />
                  Push Notifications
                </button>
              </nav>
            </div>
            <div className="flex-1">{renderContent()}</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;