"use client";

import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: [],
    priceRange: [0, 1000],
    dietary: { vegetarian: false, vegan: false, glutenFree: false },
    rating: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(query, filters);
    }
  };

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const updateFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="relative w-full max-w-3xl sm:max-w-4xl mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search for snacks, categories, or canteens..."
          className="w-full px-4 sm:px-5 py-2 sm:py-3 pl-10 sm:pl-12 pr-16 sm:pr-20 text-gray-900 placeholder-gray-500 bg-green-100 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition-all duration-200 text-sm sm:text-base"
        />
        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} sm:size={20} />
        <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 flex space-x-1 sm:space-x-2">
          <button
            onClick={handleSearch}
            className="text-gray-400 hover:text-green-600 transition-colors duration-150"
          >
            <Search size={16} sm:size={20} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-400 hover:text-green-600 transition-colors duration-150"
          >
            <Filter size={16} sm:size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 sm:mt-2 bg-green-100 rounded-xl shadow-xl border border-green-200 p-3 sm:p-5"
          >
            <div className="flex justify-between items-center mb-3 sm:mb-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-green-600 transition-colors duration-150"
              >
                <X size={16} sm:size={20} />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Categories</h4>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {["Breakfast", "Lunch", "Dinner", "Snacks", "Beverages"].map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        const newCategory = filters.category.includes(category)
                          ? filters.category.filter((c) => c !== category)
                          : [...filters.category, category];
                        updateFilters({ ...filters, category: newCategory });
                      }}
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 shadow-sm ${
                        filters.category.includes(category)
                          ? "bg-green-200 text-green-800"
                          : "bg-green-50 text-gray-800 hover:bg-green-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Price Range</h4>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange[1]}
                    onChange={(e) => {
                      const newPriceRange: [number, number] = [0, parseInt(e.target.value)];
                      updateFilters({ ...filters, priceRange: newPriceRange });
                    }}
                    className="w-full h-1 sm:h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <span className="text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap">$0 - ${filters.priceRange[1]}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Dietary Preferences</h4>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {Object.entries(filters.dietary).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-1 sm:space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => {
                          const newDietary = { ...filters.dietary, [key]: !value };
                          updateFilters({ ...filters, dietary: newDietary });
                        }}
                        className="rounded text-green-600 focus:ring-green-500 h-3 w-3 sm:h-4 sm:w-4 shadow-sm"
                      />
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Minimum Rating</h4>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => {
                        const newRating = rating === filters.rating ? 0 : rating;
                        updateFilters({ ...filters, rating: newRating });
                      }}
                      className={`p-0 sm:p-1 text-xl sm:text-2xl ${
                        rating <= filters.rating
                          ? "text-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                      } transition-colors duration-150`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  const resetFilters: SearchFilters = {
                    category: [],
                    priceRange: [0, 1000],
                    dietary: { vegetarian: false, vegan: false, glutenFree: false },
                    rating: 0,
                  };
                  setFilters(resetFilters);
                  setQuery("");
                  onSearch("", resetFilters);
                }}
                className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:text-green-900 font-medium transition-colors duration-200"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setShowFilters(false);
                  onSearch(query, filters);
                }}
                className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all duration-200 font-medium shadow-md"
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