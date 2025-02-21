import React from 'react';
import Layout from './layout/Layout';
import { ShoppingBag, Package, RefreshCw, MessageSquare, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const CanteenDashboard = () => {
  const [orders, setOrders] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [selectedSection, setSelectedSection] = React.useState('orders');

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `);
      setOrders(ordersData || []);

      const { data: productsData } = await supabase
        .from('products')
        .select('*');
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      toast.success(`Order status updated to ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Error updating order status');
    }
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'orders':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Order Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order: any) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{order.total_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Product Management</h2>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                Add Product
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
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
                  {products.map((product: any) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
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
                  onClick={() => setSelectedSection('orders')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    selectedSection === 'orders'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <ShoppingBag className="mr-3 h-5 w-5" />
                  Orders
                </button>

                <button
                  onClick={() => setSelectedSection('products')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    selectedSection === 'products'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Package className="mr-3 h-5 w-5" />
                  Products
                </button>

                <button
                  onClick={() => setSelectedSection('updates')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    selectedSection === 'updates'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <RefreshCw className="mr-3 h-5 w-5" />
                  Updates
                </button>

                <button
                  onClick={() => setSelectedSection('refunds')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    selectedSection === 'refunds'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <DollarSign className="mr-3 h-5 w-5" />
                  Refunds
                </button>

                <button
                  onClick={() => setSelectedSection('chat')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    selectedSection === 'chat'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Chat Support
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

export default CanteenDashboard;