// src/components/products/ProductCard.tsx
import React, { useState } from 'react';
import { Heart, Clock, Info, Plus, Minus } from 'lucide-react';
import { Database } from '../../types/database'; // Adjust path
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
  product: Database['public']['Tables']['products']['Row'];
  onAddToCart: (product: Database['public']['Tables']['products']['Row'], quantity: number) => void;
  onToggleFavorite: (productId: string) => void;
  isFavorite: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200 w-full max-w-sm flex flex-col"
    >
      <div className="relative w-full h-48 flex-shrink-0">
        {/* image_url not in minimal schema, using placeholder */}
        <img
          src={'https://via.placeholder.com/300x200'} // Fallback since image_url isn’t fetched
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => onToggleFavorite(product.id)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors duration-150"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'
            }`}
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
          <span className="text-sm font-medium text-gray-900">
            ₹{product.price.toFixed(2)}
          </span>
        </div>

        {/* description not in minimal schema, omitting or using fallback */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
          {/* Placeholder since description isn’t fetched */}
          No description available
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            {/* preparation_time not in minimal schema, using fallback */}
            <span className="text-sm text-gray-500">15 mins</span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium transition-colors duration-150"
          >
            <Info className="w-4 h-4 mr-1" />
            Details
          </button>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="py-4 border-t border-gray-200 space-y-3">
                {/* dietary_tags and customization_options not in minimal schema */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Dietary Info</h4>
                  <p className="text-sm text-gray-600">Not available</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Customization Options</h4>
                  <p className="text-sm text-gray-600">Not available</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {product.available && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-3 py-1">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-150"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-gray-900 font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-150"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <button
              onClick={() => onAddToCart(product, quantity)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium"
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