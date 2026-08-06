"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Plus, Edit2, Trash2, Search, Eye, EyeOff,
  DollarSign, CheckCircle, Loader2, X, ArrowLeft, Upload, 
  Image as ImageIcon, Clock
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
  status: "pending" | "approved" | "rejected"; // ✅ UPDATED: Matches database column name
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
  
  // ✅ UPDATED: Filter by status instead of active/inactive
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "rejected">("all");
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_per_ton: "",
    unit: "tons",
    image_url: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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
      // ✅ Ensure status has a fallback for older records
      const formattedData = data.map((m: any) => ({
        ...m,
        status: m.status || "pending"
      }));
      setMaterials(formattedData);
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
    setSelectedFile(null);
    setImagePreview("");
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
    setSelectedFile(null);
    setImagePreview(material.image_url || "");
    setShowEditModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast({ type: "error", title: "Invalid File", message: "Please select an image file." });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast({ type: "error", title: "File Too Large", message: "Image must be less than 5MB." });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToSupabase = async (file: File, materialId?: string): Promise<string | null> => {
    if (!file) return null;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addToast({ type: "error", title: "Error", message: "User not authenticated." });
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${materialId || Date.now()}.${fileExt}`;
      const filePath = `materials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('material-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('material-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      addToast({ type: "error", title: "Upload Failed", message: error.message || "Failed to upload image." });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!formData.name || !formData.price_per_ton) {
      addToast({ type: "error", title: "Error", message: "Please fill in all required fields." });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let imageUrl = formData.image_url;

    if (selectedFile) {
      const uploadedUrl = await uploadImageToSupabase(selectedFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const { error } = await supabase
      .from("materials")
      .insert({
        supplier_id: user.id,
        name: formData.name,
        description: formData.description,
        price_per_ton: parseFloat(formData.price_per_ton),
        unit: formData.unit,
        image_url: imageUrl,
        is_active: true,
        status: "pending", // ✅ NEW: All new materials require admin approval
      });

    if (!error) {
      addToast({ type: "success", title: "Material Submitted! 🎉", message: "Your material is pending admin approval." });
      setShowAddModal(false);
      setSelectedFile(null);
      setImagePreview("");
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

    let imageUrl = formData.image_url;

    if (selectedFile) {
      const uploadedUrl = await uploadImageToSupabase(selectedFile, selectedMaterial.id);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const { error } = await supabase
      .from("materials")
      .update({
        name: formData.name,
        description: formData.description,
        price_per_ton: parseFloat(formData.price_per_ton),
        unit: formData.unit,
        image_url: imageUrl,
        // ✅ If edited, reset to pending so admin can review the changes
        status: "pending", 
      })
      .eq("id", selectedMaterial.id);

    if (!error) {
      addToast({ type: "success", title: "Material Updated! ✅", message: "Changes submitted for admin review." });
      setShowEditModal(false);
      setSelectedFile(null);
      setImagePreview("");
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
        message: `Material is now ${material.is_active ? "hidden" : "visible"} in your dashboard.` 
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

  // ✅ UPDATED: Filter logic for status
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || m.status === filterStatus;
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
              <p className="text-muted-foreground mt-1">Manage your inventory. New items require admin approval.</p>
            </div>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" /> Add Material
          </button>
        </div>

        {/* ✅ UPDATED: Stats now show Status breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Materials", value: materials.length, icon: Package, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Approved", value: materials.filter(m => m.status === "approved").length, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Pending Review", value: materials.filter(m => m.status === "pending").length, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
            { label: "Rejected", value: materials.filter(m => m.status === "rejected").length, icon: X, color: "text-red-500", bg: "bg-red-500/10" },
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
          {/* ✅ UPDATED: Filter buttons for status */}
          <div className="flex gap-2">
            {["all", "approved", "pending", "rejected"].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterStatus(filter as any)}
                className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                  filterStatus === filter
                    ? "bg-orange-500 text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {filter === "all" ? "All" : filter}
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
                  
                  {/* ✅ NEW: Status Badge */}
                  <div className="absolute top-3 right-3">
                    {material.status === "approved" && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white flex items-center gap-1 shadow-sm">
                        <CheckCircle className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {material.status === "pending" && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white flex items-center gap-1 shadow-sm">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {material.status === "rejected" && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white flex items-center gap-1 shadow-sm">
                        <X className="w-3 h-3" /> Rejected
                      </span>
                    )}
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
            <h3 className="text-xl font-bold mb-2">No materials found</h3>
            <p className="text-muted-foreground mb-6">
              {materials.length === 0
                ? "Start by adding your first material to sell."
                : "No materials match your current filters."}
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

      {/* Add Modal */}
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
                    <label className="block text-sm font-medium mb-1.5">Material Image</label>
                    <div className="space-y-3">
                      {imagePreview && (
                        <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30">
                          <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                          <button
                            onClick={() => {
                              setImagePreview("");
                              setSelectedFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-orange-500/50 transition-colors cursor-pointer"
                      >
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Click to upload image</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="text-xs text-muted-foreground">Or use image URL</span>
                        </div>
                        <div className="relative pt-4">
                          <input
                            type="text"
                            value={formData.image_url}
                            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                            className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            placeholder="https://example.com/image.jpg"
                            disabled={!!selectedFile}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMaterial}
                    disabled={isUploading}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : "Submit for Approval"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
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
                    <label className="block text-sm font-medium mb-1.5">Material Image</label>
                    <div className="space-y-3">
                      {imagePreview && (
                        <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30">
                          <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                          <button
                            onClick={() => {
                              setImagePreview("");
                              setSelectedFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-orange-500/50 transition-colors cursor-pointer"
                      >
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Click to upload new image</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="text-xs text-muted-foreground">Or use image URL</span>
                        </div>
                        <div className="relative pt-4">
                          <input
                            type="text"
                            value={formData.image_url}
                            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                            className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            placeholder="https://example.com/image.jpg"
                            disabled={!!selectedFile}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button
                    onClick={handleEditMaterial}
                    disabled={isUploading}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Submit Changes"}
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