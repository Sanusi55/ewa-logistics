"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal, TrendingUp, Package, Truck, DollarSign } from "lucide-react";

interface SearchFilters {
  category?: string;
  priceRange?: string;
  sortBy?: string;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
}

export default function AdvancedSearch({ onSearch, placeholder = "Search materials, orders, suppliers..." }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    category: "all",
    priceRange: "all",
    sortBy: "relevance",
  });

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "granite", label: "Granite" },
    { value: "sand", label: "Sand" },
    { value: "stone-base", label: "Stone Base" },
    { value: "gravel", label: "Gravel" },
    { value: "hardcore", label: "Hardcore" },
  ];

  const priceRanges = [
    { value: "all", label: "Any Price" },
    { value: "0-1000", label: "Under ₦1,000" },
    { value: "1000-5000", label: "₦1,000 - ₦5,000" },
    { value: "5000-10000", label: "₦5,000 - ₦10,000" },
    { value: "10000+", label: "Above ₦10,000" },
  ];

  const sortOptions = [
    { value: "relevance", label: "Relevance", icon: TrendingUp },
    { value: "price-low", label: "Price: Low to High", icon: DollarSign },
    { value: "price-high", label: "Price: High to Low", icon: DollarSign },
    { value: "popular", label: "Most Popular", icon: Package },
    { value: "newest", label: "Newest First", icon: Truck },
  ];

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-2 glass rounded-xl border border-border p-2 focus-within:ring-2 focus-within:ring-primary transition-all">
          <Search className="w-5 h-5 text-muted-foreground ml-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isOpen ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
            title="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 glass rounded-xl border border-border p-4 space-y-4 overflow-hidden"
            >
              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setFilters({ ...filters, category: cat.value })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        filters.category === cat.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  Price Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setFilters({ ...filters, priceRange: range.value })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        filters.priceRange === range.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  Sort By
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setFilters({ ...filters, sortBy: option.value })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          filters.sortBy === option.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setFilters({ category: "all", priceRange: "all", sortBy: "relevance" });
                    setQuery("");
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  onClick={handleSearch}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}