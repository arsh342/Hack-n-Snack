// src/components/UserDashboard.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ShoppingCart, Plus, Minus, Gift, MessageSquare } from "lucide-react";
import { getProducts, getCanteens, toggleFavorite, supabase } from "../lib/supabase";
import Layout from "./layout/Layout"; // Adjust path
import ProductGrid from "./products/ProductGrid"; // Adjust path
import SearchBar from "./search/SearchBar"; // Adjust path
import ChatWindow from "./chat/ChatWindow"; // Adjust path

// Define types based on minimal schema
interface Product {
  id: string;
  name: string;
  price: number;
  available: boolean;
  canteen_id: string;
}

interface Canteen {
  id: string;
  name: string;
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
  product: Product;
  quantity: number;
}

const UserDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRewards, setShowRewards] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
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

  useEffect(() => {
    console.log('UserDashboard rendered');
  });

  // Authentication Check
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) setUserId(user.id);
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('Failed to authenticate. Please try logging in again.');
      }
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
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
      console.log('Order completed, resetting cart');
      setCart([]);
      setRewardPoints(prev => prev + Math.floor(location.state.amount / 100));
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Load Data from Supabase
  const loadData = useCallback(async () => {
    try {
      console.log('Loading data with:', { selectedCanteen, searchQuery, searchFilters });
      setLoading(true);
      const [canteensData, productsData] = await Promise.all([
        getCanteens(),
        getProducts(selectedCanteen, undefined, {
          ...searchFilters,
          searchQuery: searchQuery,
        }),
      ]);
      setCanteens(canteensData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [selectedCanteen, searchFilters, searchQuery]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (userId) loadData();
    } else if (userId) {
      const debounceTimer = setTimeout(() => {
        console.log('Debounced data load triggered');
        loadData();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [userId, selectedCanteen, searchFilters, searchQuery, loadData]);

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
    const filtersEqual = (a: SearchFilters, b: SearchFilters) =>
      JSON.stringify(a) === JSON.stringify(b);

    if (query !== searchQuery || !filtersEqual(filters, searchFilters)) {
      console.log('Search updated:', { query, filters });
      setSearchQuery(query);
      setSearchFilters(filters);
    }
  }, [searchQuery, searchFilters]);

  // Canteen Selection
  const handleCanteenChange = (canteenId: string) => {
    setSelectedCanteen(canteenId);
  };

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
        <div className="grid grid-cols-2 gap-6 mb-10">
          <button
            onClick={() => setShowRewards(true)}
            className="flex items-center justify-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 hover:bg-gray-50"
          >
            <Gift className="h-6 w-6 mr-3 text-indigo-600" />
            <span className="text-gray-800 font-medium">Rewards ({rewardPoints} points)</span>
          </button>
          <button
            onClick={() => setShowSupport(true)}
            className="flex items-center justify-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 hover:bg-gray-50"
          >
            <MessageSquare className="h-6 w-6 mr-3 text-indigo-600" />
            <span className="text-gray-800 font-medium">Customer Support</span>
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
                className="mt-6 w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Chat Window */}
        {showSupport && userId && (
          <ChatWindow
            userId={userId}
            userRole="user"
            onClose={() => setShowSupport(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default UserDashboard;