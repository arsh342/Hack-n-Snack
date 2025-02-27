"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ShoppingCart, Plus, Minus, Gift, Clock, Heart } from "lucide-react";
import { getProducts, getCanteens, toggleFavorite, supabase } from "../lib/supabase";
import Layout from "./layout/Layout";
import ProductGrid from "./products/ProductGrid";
import SearchBar from "./search/SearchBar";
// import Header from "./layout/Header";
// import Footer from "./layout/Footer";
import Carousel from "./Carousel";

interface Canteen {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
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
  product: Product;
  quantity: number;
}

const UserDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    category: [],
    priceRange: [0, 1000],
    dietary: { vegetarian: false, vegan: false, glutenFree: false },
    rating: 0,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);

  useEffect(() => {
    const getUserAndData = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
          setUserId(user.id);
          const { data: ordersData } = await supabase
            .from("orders")
            .select(
              `
              *,
              order_items (
                *,
                product:products (*)
              )
            `
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          setPreviousOrders(ordersData || []);

          const { data: favoritesData } = await supabase
            .from("favorites")
            .select("product_id")
            .eq("user_id", user.id);
          setFavorites(favoritesData?.map((f) => f.product_id) || []);

          const [canteensData, productsData] = await Promise.all([
            getCanteens(),
            getProducts("", undefined, {
              category: [],
              priceRange: [0, 1000],
              dietary: { vegetarian: false, vegan: false, glutenFree: false },
              rating: 0,
              searchQuery: "",
            }),
          ]);
          setCanteens(canteensData);
          setProducts(productsData);
        }
      } catch (error) {
        console.error("Auth or data error:", error);
        toast.error("Failed to authenticate or load data.");
      } finally {
        setLoading(false);
      }
    };

    getUserAndData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUserId(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUserId("");
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (location.state?.orderPlaced) {
      setCart([]);
      setRewardPoints((prev) => prev + Math.floor(location.state.amount / 100));
      navigate("/", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const loadData = useCallback(
    async (query: string, filters: SearchFilters, canteenId: string) => {
      try {
        setLoading(true);
        const productsData = await getProducts(canteenId, undefined, {
          ...filters,
          searchQuery: query || "",
        });
        console.log("Loaded products:", productsData);
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(
    (query: string, filters: SearchFilters) => {
      console.log("handleSearch called with:", { query, filters });
      setSearchQuery(query);
      setSearchFilters(filters);
      loadData(query, filters, selectedCanteen);
    },
    [selectedCanteen, loadData]
  );

  const handleCanteenChange = useCallback(
    (canteenId: string) => {
      setSelectedCanteen(canteenId);
      loadData(searchQuery, searchFilters, canteenId);
    },
    [searchQuery, searchFilters, loadData]
  );

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

  const handleToggleFavorite = useCallback(
    async (productId: string) => {
      const isCurrentlyFavorite = favorites.includes(productId);
      try {
        await toggleFavorite(userId, productId, isCurrentlyFavorite);
        setFavorites((prev) =>
          isCurrentlyFavorite ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
      } catch (error) {
        toast.error("Failed to update favorites");
      }
    },
    [favorites, userId]
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-green-50 shadow-lg rounded-3xl mx-4 sm:mx-6 lg:mx-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  if (!userId) {
    return (
      <Layout>
        <div
          className="flex items-center justify-center min-h-screen shadow-lg rounded-3xl mx-4 sm:mx-6 lg:mx-8"
          style={{ backgroundImage: "radial-gradient(#7fa154, #537b3f)" }}
        >
          <p className="text-white text-lg font-semibold bg-black bg-opacity-50 py-2 px-4 rounded-xl">
            Please log in to access the dashboard
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Carousel />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-green-50 shadow-lg rounded-3xl mt-8">
        <div className="mb-12">
          <label htmlFor="canteen-select" className="block text-xl font-semibold text-gray-900 mb-3">
            Select Canteen
          </label>
          <select
            id="canteen-select"
            value={selectedCanteen}
            onChange={(e) => handleCanteenChange(e.target.value)}
            className="w-full max-w-sm rounded-xl border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent py-3 px-4 bg-green-100 text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 text-lg font-medium"
          >
            <option value="">All Canteens</option>
            {canteens.map((canteen) => (
              <option key={canteen.id} value={canteen.id}>
                {canteen.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          <button
            onClick={() => setShowRewards(true)}
            className="flex items-center justify-center p-6 bg-green-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-green-200 hover:bg-green-200"
          >
            <Gift className="h-7 w-7 mr-3 text-green-600" />
            <span className="text-gray-800 text-lg font-semibold">Rewards</span>
          </button>
          <button
            onClick={() => setShowPreviousOrders(true)}
            className="flex items-center justify-center p-6 bg-green-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-green-200 hover:bg-green-200"
          >
            <Clock className="h-7 w-7 mr-3 text-green-600" />
            <span className="text-gray-800 text-lg font-semibold">Previous Orders</span>
          </button>
          <button
            onClick={() => setShowFavorites(true)}
            className="flex items-center justify-center p-6 bg-green-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-green-200 hover:bg-green-200"
          >
            <Heart className="h-7 w-7 mr-3 text-green-600" />
            <span className="text-gray-800 text-lg font-semibold">Favorites</span>
          </button>
        </div>

        <div className="mb-12">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Menu</h2>
          <ProductGrid
            products={products}
            favorites={favorites}
            onAddToCart={addToCart}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-8 right-8 z-50">
            <div className="bg-green-100 shadow-2xl rounded-3xl p-8 w-96 border border-green-200">
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-gray-900">
                <ShoppingCart className="mr-3 h-7 w-7 text-green-600" />
                Your Cart
              </h2>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between items-center mb-6 pb-6 border-b border-green-200 last:border-b-0"
                >
                  <div className="flex items-center">
                    {item.product.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-lg mr-4 shadow-sm"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{item.product.name}</h3>
                      <p className="text-gray-600 text-sm">₹ {(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 bg-green-200 rounded-full px-4 py-2 shadow-md">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 rounded-full hover:bg-green-300 transition-all duration-300"
                    >
                      <Minus size={18} className="text-green-600" />
                    </button>
                    <span className="text-gray-800 font-semibold text-lg">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 rounded-full hover:bg-green-300 transition-all duration-300"
                    >
                      <Plus size={18} className="text-green-600" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-6 border-t border-green-200">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-gray-900 text-lg">Total:</span>
                  <span className="font-semibold text-gray-900 text-lg">
                  ₹ {cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => navigate("/checkout", { state: { cart, userId } })}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 transition-all duration-300 font-semibold text-lg shadow-md"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {showRewards && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-green-100 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-green-200">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Your Rewards</h2>
              <p className="text-lg mb-6 text-gray-700 font-medium">You have {rewardPoints} points</p>
              <div className="space-y-6">
                <div className="p-4 border border-green-200 rounded-xl bg-green-50 shadow-md">
                  <h3 className="font-semibold text-gray-800 text-lg">10% Off</h3>
                  <p className="text-sm text-gray-600 mt-2">Redeem 100 points</p>
                </div>
                <div className="p-4 border border-green-200 rounded-xl bg-green-50 shadow-md">
                  <h3 className="font-semibold text-gray-800 text-lg">Free Delivery</h3>
                  <p className="text-sm text-gray-600 mt-2">Redeem 50 points</p>
                </div>
              </div>
              <button
                onClick={() => setShowRewards(false)}
                className="mt-8 w-full bg-green-200 text-gray-800 py-4 px-6 rounded-xl hover:bg-green-300 transition-all duration-300 font-semibold text-lg shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showPreviousOrders && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-green-100 rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto border border-green-200">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Previous Orders</h2>
              {previousOrders.length === 0 ? (
                <p className="text-gray-600 text-lg font-medium">No previous orders found.</p>
              ) : (
                <div className="space-y-6">
                  {previousOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 border border-green-200 rounded-xl bg-green-50 shadow-md"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-800 text-lg">Order #{order.id.slice(0, 8)}</span>
                        <span className="text-sm text-gray-600 font-medium">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-3 space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.product.id} className="flex items-center">
                            {item.product.image && (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded-lg mr-3 shadow-sm"
                              />
                            )}
                            <p className="font-medium">
                              {item.product.name} x {item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium text-lg">
                          Total: ₹ {order.total_amount.toFixed(2)}
                        </span>
                        <span
                          className={`text-sm px-3 py-1 rounded-full font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowPreviousOrders(false)}
                className="mt-8 w-full bg-green-200 text-gray-800 py-4 px-6 rounded-xl hover:bg-green-300 transition-all duration-300 font-semibold text-lg shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showFavorites && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-green-100 rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto border border-green-200">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Your Favorites</h2>
              {favorites.length === 0 ? (
                <p className="text-gray-600 text-lg font-medium">No favorite items yet.</p>
              ) : (
                <div className="space-y-6">
                  {products
                    .filter((p) => favorites.includes(p.id))
                    .map((product) => (
                      <div
                        key={product.id}
                        className="p-4 border border-green-200 rounded-xl flex justify-between items-center bg-green-50 shadow-md"
                      >
                        <div className="flex items-center">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg mr-3 shadow-sm"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
                            <p className="text-sm text-gray-600">₹ {product.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-all duration-300 font-medium shadow-md"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                </div>
              )}
              <button
                onClick={() => setShowFavorites(false)}
                className="mt-8 w-full bg-green-200 text-gray-800 py-4 px-6 rounded-xl hover:bg-green-300 transition-all duration-300 font-semibold text-lg shadow-md"
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
