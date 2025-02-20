import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Product, Order } from '../types/database';
import { supabase, getOrders, updateOrderStatus } from '../lib/supabase';

const CanteenDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    available: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await supabase.auth.getUser();
      const canteenId = user.data.user?.id;

      const [ordersData, productsData] = await Promise.all([
        getOrders(undefined, canteenId),
        supabase.from('products').select('*').eq('canteen_id', canteenId)
      ]);

      setOrders(ordersData);
      setProducts(productsData.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await supabase.auth.getUser();
      const canteenId = user.data.user?.id;
      
      const productData = {
        ...productForm,
        canteen_id: canteenId,
      };

      if (editingProduct) {
        await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        toast.success('Product updated successfully');
      } else {
        await supabase
          .from('products')
          .insert([productData]);
        toast.success('Product added successfully');
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: 0,
        category: '',
        available: true,
      });
      loadData();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success('Order status updated');
      loadData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        toast.success('Product deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Canteen Dashboard</h1>
          <button
            onClick={() => setShowProductModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="mr-2" size={16} />
            Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Orders Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
            <div className="space-y-4">
              {orders
                .filter(order => order.status !== 'completed' && order.status !== 'cancelled')
                .map(order => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Order #{order.id.slice(0, 8)}</span>
                      <span className="px-2 py-1 rounded-full text-sm capitalize" 
                        style={{
                          backgroundColor: 
                            order.status === 'pending' ? '#FEF3C7' :
                            order.status === 'preparing' ? '#DBEAFE' :
                            order.status === 'ready' ? '#D1FAE5' : '#FEE2E2',
                          color:
                            order.status === 'pending' ? '#92400E' :
                            order.status === 'preparing' ? '#1E40AF' :
                            order.status === 'ready' ? '#065F46' : '#991B1B'
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-gray-600">Total: ₹{order.total_amount.toFixed(2)}</p>
                    <div className="mt-4 flex space-x-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'preparing')}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'ready')}
                          className="bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Mark as Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'completed')}
                          className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Complete Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
            <div className="space-y-4">
              {products.map(product => (
                <div key={product.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-gray-600">{product.description}</p>
                    <p className="text-sm mt-1">₹{product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setProductForm({
                          name: product.name,
                          description: product.description || '',
                          price: product.price,
                          category: product.category,
                          available: product.available,
                        });
                        setShowProductModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.available}
                    onChange={(e) => setProductForm(prev => ({ ...prev, available: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Available</label>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {editingProduct ? 'Update' : 'Add'} Product
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

export default CanteenDashboard;