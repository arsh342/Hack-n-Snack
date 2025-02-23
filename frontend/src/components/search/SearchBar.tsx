// SearchBar.tsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
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

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query, filters);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, filters, onSearch]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
              {/* Categories */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'].map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          category: prev.category.includes(category)
                            ? prev.category.filter(c => c !== category)
                            : [...prev.category, category]
                        }));
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

              {/* Price Range */}
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
                      setFilters(prev => ({
                        ...prev,
                        priceRange: [0, parseInt(e.target.value)]
                      }));
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-sm text-gray-600 font-medium">
                    ₹0 - ₹{filters.priceRange[1]}
                  </span>
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Dietary Preferences</h4>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(filters.dietary).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => {
                          setFilters(prev => ({
                            ...prev,
                            dietary: {
                              ...prev.dietary,
                              [key]: !value
                            }
                          }));
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

              {/* Rating */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</h4>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          rating: rating === filters.rating ? 0 : rating
                        }));
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
                  setFilters({
                    category: [],
                    priceRange: [0, 1000],
                    dietary: {
                      vegetarian: false,
                      vegan: false,
                      glutenFree: false,
                    },
                    rating: 0,
                  });
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

export default SearchBar;