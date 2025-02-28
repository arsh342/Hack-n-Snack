"use client";

import React from "react";
import { Database } from "../../types/database";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";

interface ProductGridProps {
  products: Database["public"]["Tables"]["products"]["Row"][];
  favorites: string[];
  onAddToCart: (product: Database["public"]["Tables"]["products"]["Row"], quantity: number) => void;
  onToggleFavorite: (productId: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const ProductGrid: React.FC<ProductGridProps> = ({ products, favorites, onAddToCart, onToggleFavorite }) => {
  const categories = Array.from(new Set(products.map((product) => product.category || "Uncategorized")));

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      {categories.length > 0 ? (
        categories.map((category) => (
          <div key={category} className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 capitalize">{category}</h2>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
            >
              {products
                .filter((product) => (product.category || "Uncategorized") === category)
                .map((product) => (
                  <motion.div key={product.id} variants={item} className="w-full">
                    <ProductCard
                      product={product}
                      onAddToCart={onAddToCart}
                      onToggleFavorite={onToggleFavorite}
                      isFavorite={favorites.includes(product.id)}
                    />
                  </motion.div>
                ))}
            </motion.div>
          </div>
        ))
      ) : (
        <div className="text-center py-6 sm:py-8 md:py-10 bg-green-100 rounded-xl shadow-md border border-green-200">
          <p className="text-gray-600 text-base sm:text-lg">No snacks available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;