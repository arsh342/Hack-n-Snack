// src/components/UserDashboard.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ShoppingCart, Plus, Minus, Gift, Clock, Heart, Search, Filter, X } from "lucide-react";
import { getProducts, getCanteens, toggleFavorite, supabase } from "../lib/supabase"; // Updated import
import Layout from "./layout/Layout";
import ProductGrid from "./products/ProductGrid";
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '../types/database'; // Import the Database type
type Product = Database['public']['Tables']['products']['Row'];

interface Canteen {
  id: string;
  name: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: { quantity: number; product: Product }[];
}

interface SearchFilters {
  category: string[];
  priceRange: [number, number];
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
  };
  rating: number;
}

interface CartItem {
  product: Product; // Update CartItem to use the full Product type
  quantity: number;
}

// SearchBar Component (Integrated Inline)
const SearchBar = ({ onSearch }: { onSearch: (query: string, filters: SearchFilters) => void }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: [],
    priceRange: [0, 1000],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
    },
    rating: 0,
  });

  const handleSearchChange = useCallback((newQuery: string, newFilters: SearchFilters) => {
    setQuery(newQuery);
    setFilters(newFilters);
    onSearch(newQuery, newFilters);
  }, [onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleSearchChange(e.target.value, filters);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for dishes, cuisines, or outlets..."
          className="w-full px-5 py-3 pl-12 pr-12 text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <Filter size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-5"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'].map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        const newCategory = filters.category.includes(category)
                          ? filters.category.filter(c => c !== category)
                          : [...filters.category, category];
                        handleSearchChange(query, { ...filters, category: newCategory });
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-150 ${
                        filters.category.includes(category)
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-indigo-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange[1]}
                    onChange={(e) => {
                      const newPriceRange: [number, number] = [0, parseInt(e.target.value)];
                      handleSearchChange(query, { ...filters, priceRange: newPriceRange });
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-sm text-gray-600 font-medium">
                    ₹0 - ₹{filters.priceRange[1]}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Dietary Preferences</h4>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(filters.dietary).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => {
                          const newDietary = { ...filters.dietary, [key]: !value };
                          handleSearchChange(query, { ...filters, dietary: newDietary });
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</h4>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => {
                        const newRating = rating === filters.rating ? 0 : rating;
                        handleSearchChange(query, { ...filters, rating: newRating });
                      }}
                      className={`p-1 text-2xl ${
                        rating <= filters.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      } transition-colors duration-150`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  const resetFilters: SearchFilters = {
                    category: [],
                    priceRange: [0, 1000],
                    dietary: {
                      vegetarian: false,
                      vegan: false,
                      glutenFree: false,
                    },
                    rating: 0,
                  };
                  handleSearchChange(query, resetFilters);
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors duration-150"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// UserDashboard Component
const UserDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]); // Use the full Product type
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRewards, setShowRewards] = useState(false);
  const [showPreviousOrders, setShowPreviousOrders] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    category: [],
    priceRange: [0, 1000],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
    },
    rating: 0,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('UserDashboard rendered');
  });

  // Authentication and Initial Data Load
  useEffect(() => {
    const getUserAndData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
          setUserId(user.id);
          const { data: ordersData } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (
                *,
                product:products (*)
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          setPreviousOrders(ordersData || []);

          const { data: favoritesData } = await supabase
            .from('favorites')
            .select('product_id')
            .eq('user_id', user.id);
          setFavorites(favoritesData?.map(f => f.product_id) || []);

          const [canteensData, productsData] = await Promise.all([
            getCanteens(),
            getProducts("", undefined, { category: [], priceRange: [0, 1000], dietary: { vegetarian: false, vegan: false, glutenFree: false }, rating: 0, searchQuery: "" }),
          ]);
          setCanteens(canteensData);
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Auth or data error:', error);
        toast.error('Failed to authenticate or load data.');
      } finally {
        setLoading(false);
      }
    };

    getUserAndData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUserId('');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Handle Order Completion
  useEffect(() => {
    if (location.state?.orderPlaced) {
      setCart([]);
      setRewardPoints(prev => prev + Math.floor(location.state.amount / 100));
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Load Products with Search/Filters
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const productsData = await getProducts(selectedCanteen, undefined, {
        ...searchFilters,
        searchQuery: searchQuery || "",
      });
      console.log('Loaded products:', productsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [selectedCanteen, searchFilters, searchQuery]);

  // Debounced Search Effect
  useEffect(() => {
    if (!userId || isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    console.log('Search effect triggered with:', { searchQuery, searchFilters, selectedCanteen });
    searchTimeoutRef.current = setTimeout(() => {
      loadData();
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchFilters, selectedCanteen, userId, loadData]);

  // Cart Functions
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
    toast.success("Added to cart");
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prevCart) => {
      const newCart = prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
      return newCart;
    });
  }, []);

  // Favorite Handling
  const handleToggleFavorite = useCallback(async (productId: string) => {
    const isCurrentlyFavorite = favorites.includes(productId);
    try {
      await toggleFavorite(userId, productId, isCurrentlyFavorite);
      setFavorites((prev) =>
        isCurrentlyFavorite ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  }, [favorites, userId]);

  // Search Handler
  const handleSearch = useCallback((query: string, filters: SearchFilters) => {
    console.log('handleSearch called with:', { query, filters });
    setSearchQuery(query);
    setSearchFilters(filters);
  }, []);

  // Canteen Selection
  const handleCanteenChange = useCallback((canteenId: string) => {
    setSelectedCanteen(canteenId);
  }, []);

  // Loading State
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  // Unauthenticated State
  if (!userId) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-700 text-lg">Please log in to access the dashboard</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-md">
            Welcome to Food4Code
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl opacity-90">
            Order delicious meals from our canteens, earn rewards, and enjoy a seamless dining experience.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Canteen Selection */}
        <div className="mb-10">
          <label htmlFor="canteen-select" className="block text-lg font-medium text-gray-900 mb-2">
            Select Canteen
          </label>
          <select
            id="canteen-select"
            value={selectedCanteen}
            onChange={(e) => handleCanteenChange(e.target.value)}
            className="w-full max-w-xs rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent py-3 px-4"
          >
            <option value="">All Canteens</option>
            {canteens.map((canteen) => (
              <option key={canteen.id} value={canteen.id}>
                {canteen.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <button
            onClick={() => setShowRewards(true)}
            className="flex items-center justify-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 hover:bg-gray-50"
          >
            <Gift className="h-6 w-6 mr-3 text-indigo-600" />
            <span className="text-gray-800 font-medium">Rewards ({rewardPoints} points)</span>
          </button>
          <button
            onClick={() => setShowPreviousOrders(true)}
            className="flex items-center justify-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 hover:bg-gray-50"
          >
            <Clock className="h-6 w-6 mr-3 text-indigo-600" />
            <span className="text-gray-800 font-medium">Previous Orders</span>
          </button>
          <button
            onClick={() => setShowFavorites(true)}
            className="flex items-center justify-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 hover:bg-gray-50"
          >
            <Heart className="h-6 w-6 mr-3 text-indigo-600" />
            <span className="text-gray-800 font-medium">Favorites</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-10">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Product Grid */}
        <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Menu</h2>
        <ProductGrid
          products={products}
          favorites={favorites}
          onAddToCart={addToCart}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

        {/* Cart */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white shadow-xl rounded-2xl p-6 w-96 border border-gray-100">
              <h2 className="text-xl font-semibold mb-5 flex items-center text-gray-900">
                <ShoppingCart className="mr-3 h-6 w-6 text-indigo-600" />
                Your Cart
              </h2>
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 last:border-b-0">
                  <div>
                    <h3 className="font-medium text-gray-800">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-3 py-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-150"
                    >
                      <Minus size={16} className="text-gray-600" />
                    </button>
                    <span className="text-gray-800 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-150"
                    >
                      <Plus size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-5 pt-5 border-t border-gray-200">
                <div className="flex justify-between items-center mb-5">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/checkout', { state: { cart, userId } })}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rewards Modal */}
        {showRewards && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-semibold mb-5 text-gray-900">Your Rewards</h2>
              <p className="text-lg mb-6 text-gray-700">You have {rewardPoints} points</p>
              <div className="space-y-5">
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <h3 className="font-medium text-gray-800">10% Off</h3>
                  <p className="text-sm text-gray-600 mt-1">Redeem 100 points</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <h3 className="font-medium text-gray-800">Free Delivery</h3>
                  <p className="text-sm text-gray-600 mt-1">Redeem 50 points</p>
                </div>
              </div>
              <button
                onClick={() => setShowRewards(false)}
                className="mt-6 w-full bg-gray-200 text-white-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Previous Orders Modal */}
        {showPreviousOrders && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-5 text-gray-900">Previous Orders</h2>
              {previousOrders.length === 0 ? (
                <p className="text-gray-600">No previous orders found.</p>
              ) : (
                <div className="space-y-4">
                  {previousOrders.map((order) => (
                    <div key={order.id} className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">Order #{order.id.slice(0, 8)}</span>
                        <span className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {order.order_items.map((item) => (
                          <p key={item.product.id}>
                            {item.product.name} x {item.quantity}
                          </p>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total: ₹{order.total_amount.toFixed(2)}</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowPreviousOrders(false)}
                className="mt-6 w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Favorites Modal */}
        {showFavorites && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-5 text-gray-900">Your Favorites</h2>
              {favorites.length === 0 ? (
                <p className="text-gray-600">No favorite items yet.</p>
              ) : (
                <div className="space-y-4">
                  {products.filter(p => favorites.includes(p.id)).map((product) => (
                    <div key={product.id} className="p-4 border border-gray-200 rounded-xl flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-600">₹{product.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 transition-colors duration-200"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowFavorites(false)}
                className="mt-6 w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserDashboard;