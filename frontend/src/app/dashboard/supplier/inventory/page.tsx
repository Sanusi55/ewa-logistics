"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Package, Plus, Search, Edit2, Trash2, 
  AlertCircle, CheckCircle, XCircle, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { useToast } from "@/components/providers/toast-provider";

// Mock Inventory Data
const initialInventory = [
  { id: 1, name: "1-Inch Granite", category: "Granite", stock: 120, unit: "tons", price: 45000, status: "healthy" },
  { id: 2, name: "3/4 Granite", category: "Granite", stock: 45, unit: "tons", price: 40000, status: "healthy" },
  { id: 3, name: "Sharp Sand", category: "Sand", stock: 8, unit: "tons", price: 15000, status: "low" },
  { id: 4, name: "Stone Base", category: "Stone", stock: 0, unit: "tons", price: 30000, status: "out" },
  { id: 5, name: "Stone Dust", category: "Sand", stock: 200, unit: "tons", price: 12000, status: "healthy" },
  { id: 6, name: "Hardcore Granite", category: "Granite", stock: 15, unit: "tons", price: 35000, status: "low" },
];

function InventorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 w-full bg-muted rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

export default function SupplierInventoryPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [inventory, setInventory] = useState(initialInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "healthy": return { label: "In Stock", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle };
      case "low": return { label: "Low Stock", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30", icon: AlertCircle };
      case "out": return { label: "Out of Stock", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: XCircle };
      default: return { label: "Unknown", color: "text-gray-600", bg: "bg-gray-100", icon: AlertCircle };
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: number, name: string) => {
    setInventory(inventory.filter(item => item.id !== id));
    addToast({ type: "success", title: "Material Removed", message: `${name} has been removed from your inventory.` });
  };

  const handleEdit = (name: string) => {
    addToast({ type: "info", title: "Edit Material", message: `Opening editor for ${name}...` });
  };

  const handleAddMaterial = () => {
    addToast({ type: "info", title: "Add Material", message: "Opening new material form..." });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/supplier">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Inventory Management</h1>
              <p className="text-muted-foreground mt-1">Track stock levels, update prices, and manage your materials.</p>
            </div>
          </div>
          <button 
            onClick={handleAddMaterial}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" /> Add New Material
          </button>
        </div>

        {/* Filters & Search */}
        <div className="glass p-4 rounded-xl border border-border flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by material name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-sm transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            {["all", "granite", "sand", "stone"].map((cat) => (
              <button 
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat 
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="glass rounded-xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-6"><InventorySkeleton /></div>
          ) : filteredInventory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="text-left p-4 font-medium">Material Name</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">Category</th>
                    <th className="text-left p-4 font-medium">Stock Level</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">Price per Ton</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInventory.map((item) => {
                    const status = getStatusConfig(item.status);
                    const StatusIcon = status.icon;
                    
                    return (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                              <Package className="w-5 h-5 text-orange-500" />
                            </div>
                            <span className="font-semibold text-foreground">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell capitalize">{item.category}</td>
                        <td className="p-4">
                          <span className="font-medium text-foreground">{item.stock}</span>
                          <span className="text-muted-foreground text-xs ml-1">{item.unit}</span>
                        </td>
                        <td className="p-4 font-semibold text-foreground hidden md:table-cell">
                          {formatNaira(item.price)}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(item.name)}
                              className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id, item.name)}
                              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-1">No materials found</h3>
              <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filter criteria.</p>
              <button 
                onClick={() => { setSearchQuery(""); setCategoryFilter("all"); }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}