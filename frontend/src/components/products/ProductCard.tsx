// src/components/products/ProductCard.tsx
import React, { useState } from "react";
import { Heart, Clock, Info, Plus, Minus } from "lucide-react";
import { Database } from "../../types/database";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: Database["public"]["Tables"]["products"]["Row"];
  onAddToCart: (product: Database["public"]["Tables"]["products"]["Row"], quantity: number) => void;
  onToggleFavorite: (productId: string) => void;
  isFavorite: boolean;
}
const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onToggleFavorite, isFavorite }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };
<<<<<<< Updated upstream

  // Helper to format dietary info
  const getDietaryInfo = () => {
    const { dietary_info } = product;
    const tags = [];
    if (dietary_info.vegetarian) tags.push('Vegetarian');
    if (dietary_info.vegan) tags.push('Vegan');
    if (dietary_info.gluten_free) tags.push('Gluten-Free');
    if (dietary_info.contains_nuts) tags.push('Contains Nuts');
    if (dietary_info.spicy_level > 0) tags.push(`Spicy (Level ${dietary_info.spicy_level})`);
    return tags.length > 0 ? tags.join(', ') : 'No dietary info available';
  };

  // Helper to format customization options
  const getCustomizationOptions = () => {
    if (!product.customization_options?.length) return 'No customizations available';
    return product.customization_options
      .map((opt) => `${opt.name}: ${opt.options.map((o) => o.name).join(', ')}`)
      .join('; ');
  };

=======
>>>>>>> Stashed changes
  return (
    <motion.div
      layout
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200 w-full max-w-sm flex flex-col"
    >
      <div className="relative w-full h-48 flex-shrink-0">
        <img
<<<<<<< Updated upstream
          src={product.image_url || 'https://via.placeholder.com/300x200'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
=======
          src={product.image || "https://via.placeholder.com/300x200"} // Use product.image with fallback
          alt={product.name}
          className="w-full h-full object-cover rounded-t-xl"
>>>>>>> Stashed changes
        />
        <button
          onClick={() => onToggleFavorite(product.id)}
          className="absolute top-4 right-4 p-2 rounded-full bg-green-200 shadow-md hover:bg-green-300 transition-all duration-150"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? "text-red-500 fill-current" : "text-gray-600"}`}
          />
        </button>
        {!product.available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
          <span className="text-sm font-medium text-gray-900">$ {product.price.toFixed(2)}</span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
<<<<<<< Updated upstream
          {product.description || 'No description available'}
=======
          {product.description || "No description available"}
>>>>>>> Stashed changes
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
<<<<<<< Updated upstream
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {product.preparation_time} mins
            </span>
=======
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-500">{product.preparation_time || "15 mins"}</span>
>>>>>>> Stashed changes
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium transition-colors duration-150"
          >
            <Info className="w-4 h-4 mr-1" />
            Details
          </button>
        </div>
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
<<<<<<< Updated upstream
              <div className="py-4 border-t border-gray-200 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Dietary Info</h4>
                  <p className="text-sm text-gray-600">{getDietaryInfo()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Customization Options</h4>
                  <p className="text-sm text-gray-600">{getCustomizationOptions()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Cuisine</h4>
                  <p className="text-sm text-gray-600">{product.cuisine_type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Rating</h4>
                  <p className="text-sm text-gray-600">
                    {product.rating.toFixed(1)} ({product.review_count} reviews)
=======
              <div className="py-4 border-t border-green-200 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Dietary Info</h4>
                  <p className="text-sm text-gray-600">
                    {product.dietary_tags?.join(", ") || "Not available"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Customization Options</h4>
                  <p className="text-sm text-gray-600">
                    {product.customization_options || "Not available"}
>>>>>>> Stashed changes
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {product.available && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 bg-green-200 rounded-full px-3 py-1 shadow-sm">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="p-1 rounded-full hover:bg-green-300 transition-colors duration-150"
              >
                <Minus className="w-4 h-4 text-green-600" />
              </button>
              <span className="text-gray-900 font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="p-1 rounded-full hover:bg-green-300 transition-colors duration-150"
              >
                <Plus className="w-4 h-4 text-green-600" />
              </button>
            </div>
            <button
              onClick={() => onAddToCart(product, quantity)}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium shadow-md"
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;