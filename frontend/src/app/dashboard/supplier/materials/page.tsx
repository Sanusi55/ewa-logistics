"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Plus, Edit2, Trash2, Search, Eye, EyeOff,
  DollarSign, CheckCircle, Loader2, X, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { useToast } from "@/components/providers/toast-provider";
import { createClient } from "@/lib/supabase/client";

interface Material {
  id: string;
  name: string;
  description: string;
  price_per_ton: number;
  unit: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export default function SupplierMaterialsPage() {
  const { addToast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_per_ton: "",
    unit: "tons",
    image_url: "",
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from("materials")
      .select("*")
      .eq("supplier_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setMaterials(data);
    }

    setIsLoading(false);
  }

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      description: "",
      price_per_ton: "",
      unit: "tons",
      image_url: "",
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name,
      description: material.description || "",
      price_per_ton: material.price_per_ton.toString(),
      unit: material.unit,
      image_url: material.image_url || "",
    });
    setShowEditModal(true);
  };

  const handleAddMaterial = async () => {
    if (!formData.name || !formData.price_per_ton) {
      addToast({ type: "error", title: "Error", message: "Please fill in all required fields." });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("materials")
      .insert({
        supplier_id: user.id,
        name: formData.name,
        description: formData.description,
        price_per_ton: parseFloat(formData.price_per_ton),
        unit: formData.unit,
        image_url: formData.image_url,
        is_active: true,
      });

    if (!error) {
      addToast({ type: "success", title: "Material Added! 🎉", message: "Your material has been added successfully." });
      setShowAddModal(false);
      fetchMaterials();
    } else {
      addToast({ type: "error", title: "Error", message: "Failed to add material." });
    }
  };

  const handleEditMaterial = async () => {
    if (!selectedMaterial || !formData.name || !formData.price_per_ton) {
      addToast({ type: "error", title: "Error", message: "Please fill in all required fields." });
      return;
    }

    const { error } = await supabase
      .from("materials")
      .update({
        name: formData.name,
        description: formData.description,
        price_per_ton: parseFloat(formData.price_per_ton),
        unit: formData.unit,
        image_url: formData.image_url,
      })
      .eq("id", selectedMaterial.id);

    if (!error) {
      addToast({ type: "success", title: "Material Updated! ✅", message: "Your material has been updated successfully." });
      setShowEditModal(false);
      fetchMaterials();
    } else {
      addToast({ type: "error", title: "Error", message: "Failed to update material." });
    }
  };

  const handleToggleActive = async (material: Material) => {
    const { error } = await supabase
      .from("materials")
      .update({ is_active: !material.is_active })
      .eq("id", material.id);

    if (!error) {
      addToast({ 
        type: "success", 
        title: material.is_active ? "Material Hidden" : "Material Visible", 
        message: `Material is now ${material.is_active ? "hidden" : "visible"} to customers.` 
      });
      fetchMaterials();
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this material? This action cannot be undone.")) {
      return;
    }

    const { error } = await supabase
      .from("materials")
      .delete()
      .eq("id", materialId);

    if (!error) {
      addToast({ type: "success", title: "Material Deleted", message: "Material has been removed." });
      fetchMaterials();
    } else {
      addToast({ type: "error", title: "Error", message: "Failed to delete material." });
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterActive === "all" || 
                          (filterActive === "active" && m.is_active) ||
                          (filterActive === "inactive" && !m.is_active);
    return matchesSearch && matchesFilter;
  });

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/supplier">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Materials</h1>
              <p className="text-muted-foreground mt-1">Manage your material inventory and pricing.</p>
            </div>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" /> Add Material
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Materials", value: materials.length, icon: Package, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Active", value: materials.filter(m => m.is_active).length, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Hidden", value: materials.filter(m => !m.is_active).length, icon: EyeOff, color: "text-gray-500", bg: "bg-gray-500/10" },
            { label: "Avg Price", value: materials.length > 0 ? formatNaira(materials.reduce((sum, m) => sum + m.price_per_ton, 0) / materials.length) : "₦0", icon: DollarSign, color: "text-blue-500", bg: "bg-blue-500/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-5 rounded-xl border border-border flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <span className="text-xl md:text-2xl font-bold">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        <div className="glass p-4 rounded-xl border border-border flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "inactive"].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterActive(filter as any)}
                className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                  filterActive === filter
                    ? "bg-orange-500 text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-2xl border border-border overflow-hidden group hover:border-orange-500/30 transition-all"
              >
                <div className="relative h-48 bg-gradient-to-br from-orange-500/10 to-red-500/10 overflow-hidden">
                  {material.image_url ? (
                    <img
                      src={material.image_url}
                      alt={material.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                    material.is_active
                      ? "bg-green-500 text-white"
                      : "bg-gray-500 text-white"
                  }`}>
                    {material.is_active ? "Active" : "Hidden"}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2">{material.name}</h3>
                  {material.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{material.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Price per {material.unit}</p>
                      <p className="text-2xl font-bold text-orange-500">{formatNaira(material.price_per_ton)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <button
                      onClick={() => handleToggleActive(material)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        material.is_active
                          ? "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20"
                          : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                      }`}
                    >
                      {material.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {material.is_active ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(material)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-orange-500/10 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-500/20 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-600 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-12 border border-border border-dashed text-center"
          >
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No materials yet</h3>
            <p className="text-muted-foreground mb-6">
              {materials.length === 0
                ? "Start by adding your first material to sell."
                : "No materials match your filters."}
            </p>
            {materials.length === 0 && (
              <button
                onClick={handleOpenAddModal}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer"
              >
                Add Your First Material
              </button>
            )}
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-lg w-full p-6 pointer-events-auto border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Plus className="w-6 h-6 text-orange-500" /> Add New Material
                  </h3>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Material Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      placeholder="e.g. Sharp Sand"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                      placeholder="Brief description of your material..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Price per {formData.unit} <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={formData.price_per_ton}
                        onChange={(e) => setFormData({...formData, price_per_ton: e.target.value})}
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        placeholder="15000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Unit</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      >
                        <option value="tons">Tons</option>
                        <option value="kg">Kilograms</option>
                        <option value="bags">Bags</option>
                        <option value="trips">Trips</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Image URL</label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMaterial}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
                  >
                    Add Material
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && selectedMaterial && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-lg w-full p-6 pointer-events-auto border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Edit2 className="w-6 h-6 text-orange-500" /> Edit Material
                  </h3>
                  <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Material Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Price per {formData.unit} <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={formData.price_per_ton}
                        onChange={(e) => setFormData({...formData, price_per_ton: e.target.value})}
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Unit</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      >
                        <option value="tons">Tons</option>
                        <option value="kg">Kilograms</option>
                        <option value="bags">Bags</option>
                        <option value="trips">Trips</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Image URL</label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditMaterial}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}