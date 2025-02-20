import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { products, categories } from '../data/mockData';

const UserDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category.toLowerCase() === selectedCategory);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setShowCart(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Menu className="h-6 w-6 mr-4 text-gray-600" />
              <span className="text-2xl font-bold text-green-600">SaladWorks</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search meals..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <User className="h-6 w-6 text-gray-600" />
              </button>
              
              <button 
                className="p-2 hover:bg-gray-100 rounded-full relative"
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${selectedCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span>{product.nutritional_info.calories} cal</span>
                    <span>{product.nutritional_info.protein}g protein</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">${product.price}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Your Cart</h2>
                <button 
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-gray-500">
                            ${item.product.price} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                    Checkout (${cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;