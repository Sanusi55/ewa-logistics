"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Heart, Eye, ShoppingCart, Package, Truck,
  MapPin, Star, Shield, Award, TrendingUp, X, Loader2
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { useToast } from "@/components/providers/toast-provider";
import { getMaterials } from "@/app/actions/materials";
import { createClient } from "@/lib/supabase/client";

interface Material {
  id: string;
  name: string;
  description: string;
  price_per_ton: number;
  unit: string;
  image_url: string;
  supplier_id: string;
  is_active: boolean;
  created_at: string;
}

interface Supplier {
  id: string;
  full_name: string;
  state: string;
}

export default function MaterialsPage() {
  const { addToast } = useToast();
  const supabase = createClient();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Record<string, Supplier>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewItem, setQuickViewItem] = useState<Material | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ 
    category: "all", 
    priceRange: "all", 
    state: "all",
    sortBy: "newest" 
  });

  useEffect(() => {
    async function fetchMaterials() {
      setIsLoading(true);
      const { data, error } = await getMaterials();
      
      if (error) {
        addToast({ type: "error", title: "Error", message: "Failed to load materials" });
      } else {
        setMaterials(data || []);
        
        // Fetch supplier information
        if (data && data.length > 0) {
          const supplierIds = [...new Set(data.map(m => m.supplier_id))];
          const { data: supplierData } = await supabase
            .from("profiles")
            .select("id, full_name, state")
            .in("id", supplierIds);
          
          if (supplierData) {
            const supplierMap: Record<string, Supplier> = {};
            supplierData.forEach(s => {
              supplierMap[s.id] = s;
            });
            setSuppliers(supplierMap);
          }
        }
      }
      setIsLoading(false);
    }
    fetchMaterials();

    // ✅ Fluctuating Display: Shuffle materials every 10 minutes (600,000 ms)
    // This ensures newly registered suppliers get visibility over time.
    const shuffleInterval = setInterval(() => {
      setMaterials(prev => {
        const shuffled = [...prev];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      });
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(shuffleInterval);
  }, []);

  const toggleWishlist = (id: string, name: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((item) => item !== id));
      addToast({ type: "info", title: "Removed from wishlist", message: `${name} removed.` });
    } else {
      setWishlist([...wishlist, id]);
      addToast({ type: "success", title: "Added to wishlist", message: `${name} saved for later!` });
    }
  };

  const filteredMaterials = useMemo(() => {
    let result = materials.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filters.category === "all" || 
                              item.name.toLowerCase().includes(filters.category.toLowerCase());
      
      let matchesPrice = true;
      if (filters.priceRange === "0-15000") matchesPrice = item.price_per_ton < 15000;
      else if (filters.priceRange === "15000-30000") matchesPrice = item.price_per_ton >= 15000 && item.price_per_ton <= 30000;
      else if (filters.priceRange === "30000-45000") matchesPrice = item.price_per_ton > 30000 && item.price_per_ton <= 45000;
      else if (filters.priceRange === "45000+") matchesPrice = item.price_per_ton > 45000;

      const supplier = suppliers[item.supplier_id];
      const matchesState = filters.state === "all" || 
                           (supplier && supplier.state === filters.state);

      return matchesSearch && matchesCategory && matchesPrice && matchesState;
    });

    // Sorting
    if (filters.sortBy === "price-low") {
      result.sort((a, b) => a.price_per_ton - b.price_per_ton);
    } else if (filters.sortBy === "price-high") {
      result.sort((a, b) => b.price_per_ton - a.price_per_ton);
    } else if (filters.sortBy === "newest") {
      result.sort((a, b) => {
        const dateDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (dateDiff === 0) {
          // If created at the same time, use the 10-minute shuffled order for fairness
          return materials.indexOf(a) - materials.indexOf(b);
        }
        return dateDiff;
      });
    }

    return result;
  }, [searchQuery, filters, materials, suppliers]);

  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", 
    "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", 
    "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", 
    "Federal Capital Territory"
  ];

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 md:pt-32 px-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Premium Construction <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Materials</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Source the best granite, sand, and stone for your next big project. 
            Direct from verified suppliers with escrow protection.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for granite, sand, stone base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 transition-all text-lg"
            />
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {[
            { icon: Shield, label: "Secure Escrow", desc: "Funds protected until delivery", color: "text-green-500" },
            { icon: Award, label: "Verified Suppliers", desc: "All suppliers are vetted", color: "text-orange-500" },
            { icon: TrendingUp, label: "Best Prices", desc: "Competitive market rates", color: "text-blue-500" },
          ].map((badge, i) => (
            <div key={i} className="glass p-4 rounded-xl border border-border flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${badge.color}`}>
                <badge.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{badge.label}</p>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-4 rounded-2xl border border-border mb-8"
        >
          <div className="grid md:grid-cols-3 gap-3">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-sm"
              >
                <option value="all">All Materials</option>
                <option value="sand">Sand</option>
                <option value="granite">Granite</option>
                <option value="stone">Stone</option>
                <option value="gravel">Gravel</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-sm"
              >
                <option value="all">All Prices</option>
                <option value="0-15000">Under ₦15,000</option>
                <option value="15000-30000">₦15,000 - ₦30,000</option>
                <option value="30000-45000">₦30,000 - ₦45,000</option>
                <option value="45000+">Above ₦45,000</option>
              </select>
            </div>

            {/* ✅ State Filter */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Supplier State</label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({...filters, state: e.target.value})}
                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-sm"
              >
                <option value="all">All States</option>
                {nigerianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="mt-3 pt-3 border-t border-border">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Sort by</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </motion.div>

        {/* Results Count & Wishlist Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredMaterials.length}</span> materials
            {filters.state !== "all" && <span> in <span className="text-orange-500">{filters.state}</span></span>}
          </p>
          {wishlist.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-500 font-medium">
              <Heart className="w-4 h-4 fill-orange-500" />
              {wishlist.length} items in wishlist
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredMaterials.length > 0 ? (
          /* Materials Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((item, index) => {
              const supplier = suppliers[item.supplier_id];
              const isWishlisted = wishlist.includes(item.id);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group glass rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border flex flex-col relative"
                >
                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(item.id, item.name)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-orange-500 text-orange-500" : "text-muted-foreground"}`} />
                  </button>

                  {/* Image */}
                  <div className="relative h-48 w-full bg-gradient-to-br from-orange-500/10 to-red-500/10 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4">
                        <Package className="w-16 h-16 mb-2 opacity-30" />
                        <div className="text-lg font-bold text-center">{item.name}</div>
                      </div>
                    )}
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-lg">
                      {formatNaira(item.price_per_ton)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold">{item.name}</h3>
                      <span className="text-sm text-muted-foreground">/{item.unit}</span>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    {/* Supplier Info */}
                    {supplier && (
                      <div className="flex items-center gap-2 mb-4 p-2 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {supplier.full_name?.charAt(0) || "S"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{supplier.full_name || "Supplier"}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {supplier.state || "Nigeria"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                          <Star className="w-3 h-3 fill-yellow-500" />
                          <span className="font-medium">4.8</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                      <button 
                        onClick={() => setQuickViewItem(item)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer text-sm"
                      >
                        <Eye className="w-4 h-4" /> Quick View
                      </button>
                      <Link href={`/order?material=${item.id}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer text-sm">
                        <ShoppingCart className="w-4 h-4" /> Order
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* ✅ Smart Empty State */
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              {filters.state !== "all" ? (
                <MapPin className="w-8 h-8 text-muted-foreground" />
              ) : (
                <Search className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">No materials found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {materials.length === 0
                ? "No suppliers have added materials yet. Check back soon!"
                : filters.state !== "all"
                ? `No suppliers found in ${filters.state}. Please try selecting another state to find available materials.`
                : "Try adjusting your search or filters."}
            </p>
            {materials.length === 0 ? (
              <Link href="/signup">
                <button className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer">
                  Become a Supplier
                </button>
              </Link>
            ) : (
              <button 
                onClick={() => { 
                  setSearchQuery(""); 
                  setFilters({ category: "all", priceRange: "all", state: "all", sortBy: "newest" }); 
                }}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </main>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewItem && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewItem(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto border border-border shadow-2xl">
                <div className="relative h-64 w-full bg-gradient-to-br from-orange-500/10 to-red-500/10">
                  {quickViewItem.image_url ? (
                    <img
                      src={quickViewItem.image_url}
                      alt={quickViewItem.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4">
                      <Package className="w-20 h-20 mb-2 opacity-30" />
                      <div className="text-2xl font-bold text-center">{quickViewItem.name}</div>
                    </div>
                  )}
                  <button 
                    onClick={() => setQuickViewItem(null)}
                    className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-muted transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{quickViewItem.name}</h2>
                      {suppliers[quickViewItem.supplier_id] && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{suppliers[quickViewItem.supplier_id].full_name}</span>
                          <span>•</span>
                          <span>{suppliers[quickViewItem.supplier_id].state}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-orange-500">{formatNaira(quickViewItem.price_per_ton)}</div>
                      <div className="text-sm text-muted-foreground">per {quickViewItem.unit}</div>
                    </div>
                  </div>
                  
                  {quickViewItem.description && (
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {quickViewItem.description}
                    </p>
                  )}

                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">Secure Escrow Protection</p>
                        <p className="text-xs text-muted-foreground">
                          Your payment is held securely until you confirm delivery. Full refund if not delivered.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border">
                    <button 
                      onClick={() => {
                        toggleWishlist(quickViewItem.id, quickViewItem.name);
                        setQuickViewItem(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${wishlist.includes(quickViewItem.id) ? "fill-orange-500 text-orange-500" : ""}`} /> 
                      {wishlist.includes(quickViewItem.id) ? "Saved" : "Save to Wishlist"}
                    </button>
                    <Link 
                      href={`/order?material=${quickViewItem.id}`} 
                      onClick={() => setQuickViewItem(null)}
                      className="flex-[2] flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" /> Proceed to Order
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}