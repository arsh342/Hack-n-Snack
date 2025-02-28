"use client";

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

  const getDietaryInfo = () => {
    const { dietary_info } = product;
    const tags = [];
    if (dietary_info.vegetarian) tags.push("Vegetarian");
    if (dietary_info.vegan) tags.push("Vegan");
    if (dietary_info.gluten_free) tags.push("Gluten-Free");
    if (dietary_info.contains_nuts) tags.push("Contains Nuts");
    if (dietary_info.spicy_level > 0) tags.push(`Spicy (Level ${dietary_info.spicy_level})`);
    return tags.length > 0 ? tags.join(", ") : "Not available";
  };

  const getCustomizationOptions = () => {
    if (!product.customization_options?.length) return "Not available";
    return product.customization_options
      .map((opt) => `${opt.name}: ${opt.options.map((o) => `${o.name} (+$${o.price})`).join(", ")}`)
      .join("; ");
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200 w-full max-w-[20rem] sm:max-w-sm flex flex-col"
    >
      <div className="relative w-full h-40 sm:h-48 flex-shrink-0">
        <img
          src={product.image_url || "https://via.placeholder.com/300x200"}
          alt={product.name}
          className="w-full h-full object-cover rounded-t-xl"
          loading="lazy"
        />
        <button
          onClick={() => onToggleFavorite(product.id)}
          className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1 sm:p-2 rounded-full bg-green-200 shadow-md hover:bg-green-300 transition-all duration-150"
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? "text-red-500 fill-current" : "text-gray-600"}`}
          />
        </button>
        {!product.available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm sm:text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
          <span className="text-xs sm:text-sm font-medium text-gray-900">₹{product.price.toFixed(2)}</span>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4 line-clamp-2 flex-grow">
          {product.description || "No description available"}
        </p>

        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            <span className="text-xs sm:text-sm text-gray-500">
              {product.preparation_time ? `${product.preparation_time} mins` : "15 mins"}
            </span>
          </div>
          {/* <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-green-600 hover:text-green-700 flex items-center text-xs sm:text-sm font-medium transition-colors duration-150"
          >
            <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Details
          </button> */}
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="py-2 sm:py-4 border-t border-green-200 space-y-2 sm:space-y-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Dietary Info</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{getDietaryInfo()}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Customization Options</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{getCustomizationOptions()}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Cuisine Type</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{product.cuisine_type}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Rating</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {product.rating.toFixed(1)} ({product.review_count} reviews)
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {product.available && (
          <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3 bg-green-200 rounded-full px-2 sm:px-3 py-1 shadow-sm">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="p-1 rounded-full hover:bg-green-300 transition-colors duration-150"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </button>
              <span className="text-gray-900 font-medium text-sm sm:text-base">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="p-1 rounded-full hover:bg-green-300 transition-colors duration-150"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </button>
            </div>
            <button
              onClick={() => onAddToCart(product, quantity)}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium shadow-md text-xs sm:text-sm"
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