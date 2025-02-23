import React from 'react';
import Layout from './layout/Layout';
import { Users, Bell, MessageSquare, Store, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminDashboard = () => {
  const [users, setUsers] = React.useState([]);
  const [canteens, setCanteens] = React.useState([]);
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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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
                  {users.map((user: any) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role}
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
                  {canteens.map((canteen: any) => (
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
          <div className="flex flex-col md:flex-row md:space-x-6">
            {/* Sidebar */}
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

                <button
                  onClick={() => setSelectedSection('support')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    selectedSection === 'support'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Support Chat
                </button>
              </nav>
            </div>

            {/* Main content */}
            <div className="flex-1">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;