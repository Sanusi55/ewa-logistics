"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, Package, Ruler, Layers, Info, CheckCircle, X, ArrowRight
} from "lucide-react";
import Link from "next/link";

interface MaterialInfo {
  name: string;
  density: number; // tons per cubic meter
  pricePerTon: number;
  icon: string;
}

const materials: Record<string, MaterialInfo> = {
  "1-inch-granite": { name: "1-Inch Granite", density: 2.7, pricePerTon: 45000, icon: "🪨" },
  "3-4-granite": { name: "3/4 Granite", density: 2.6, pricePerTon: 40000, icon: "🪨" },
  "1-2-inch-granite": { name: "1/2-Inch Granite", density: 1.5, pricePerTon: 42000, icon: "🪨" },
  "3-8-inch-granite": { name: "3/8-Inch Granite", density: 1.45, pricePerTon: 40000, icon: "🪨" },
  "sharp-sand": { name: "Sharp Sand", density: 1.6, pricePerTon: 15000, icon: "⏳" },
  "stone-base": { name: "Stone Base", density: 2.4, pricePerTon: 30000, icon: "🏗️" },
  "gravel": { name: "Gravel", density: 1.8, pricePerTon: 25000, icon: "🪨" },
  "laterite": { name: "Laterite", density: 1.9, pricePerTon: 12000, icon: "🟤" },
};

export default function MaterialCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState("1-inch-granite");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [thickness, setThickness] = useState("");
  const [unit, setUnit] = useState<"meters" | "feet">("meters");

  // Convert feet to meters if needed
  const convertToMeters = (value: number) => {
    return unit === "feet" ? value * 0.3048 : value;
  };

  // Calculate results in real-time
  const results = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const t = parseFloat(thickness) || 0;

    if (l <= 0 || w <= 0 || t <= 0) return null;

    const lMeters = convertToMeters(l);
    const wMeters = convertToMeters(w);
    const tMeters = convertToMeters(t);

    const volumeCubicMeters = lMeters * wMeters * tMeters;
    const material = materials[selectedMaterial];
    const tonsNeeded = volumeCubicMeters * material.density;

    return {
      volume: volumeCubicMeters.toFixed(2),
      tons: tonsNeeded.toFixed(2),
      material: material.name,
    };
  }, [length, width, thickness, selectedMaterial, unit]);

  const resetCalculator = () => {
    setLength("");
    setWidth("");
    setThickness("");
  };

  return (
    <>
      {/* Floating Calculator Button (CENTERED AT BOTTOM) */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all cursor-pointer group"
        title="Material Calculator"
      >
        <Calculator className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="text-sm font-semibold hidden md:inline">Calculate</span>
      </motion.button>

      {/* 🧮 Calculator Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none overflow-y-auto"
            >
              <div className="glass rounded-2xl max-w-2xl w-full my-16 md:my-8 pointer-events-auto border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
                
                {/* Header */}
                <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border p-6 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Calculator className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Material Calculator</h2>
                        <p className="text-sm text-muted-foreground">Estimate quantity for your project</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  
                  {/* Material Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-orange-500" />
                      Select Material
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(materials).map(([key, material]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedMaterial(key)}
                          className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                            selectedMaterial === key
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-border hover:border-orange-500/30 hover:bg-muted/50"
                          }`}
                        >
                          <div className="text-2xl mb-1">{material.icon}</div>
                          <div className="text-xs font-medium">{material.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {material.density} tons/m³
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Unit Toggle */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border">
                    <span className="text-sm font-medium">Measurement Unit</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUnit("meters")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          unit === "meters"
                            ? "bg-orange-500 text-white"
                            : "bg-background hover:bg-muted"
                        }`}
                      >
                        Meters
                      </button>
                      <button
                        onClick={() => setUnit("feet")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          unit === "feet"
                            ? "bg-orange-500 text-white"
                            : "bg-background hover:bg-muted"
                        }`}
                      >
                        Feet
                      </button>
                    </div>
                  </div>

                  {/* Dimensions Input */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-orange-500" />
                        Length
                      </label>
                      <input
                        type="number"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{unit}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-orange-500 rotate-90" />
                        Width
                      </label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{unit}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-orange-500" />
                        Thickness
                      </label>
                      <input
                        type="number"
                        value={thickness}
                        onChange={(e) => setThickness(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{unit}</p>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">How it works:</p>
                      <p>Enter your project dimensions above. We'll calculate the exact volume and convert it to tons based on the material's density so you know exactly how much to order.</p>
                    </div>
                  </div>

                  {/* Results */}
                  <AnimatePresence mode="wait">
                    {results && (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl">
                          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-orange-500" />
                            Calculation Results
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-background/50 rounded-xl border border-border/50">
                              <p className="text-xs text-muted-foreground mb-1">Volume Needed</p>
                              <p className="text-2xl font-bold">{results.volume} <span className="text-sm font-normal text-muted-foreground">m³</span></p>
                            </div>
                            <div className="p-4 bg-background/50 rounded-xl border border-border/50">
                              <p className="text-xs text-muted-foreground mb-1">Weight Required</p>
                              <p className="text-2xl font-bold">{results.tons} <span className="text-sm font-normal text-muted-foreground">tons</span></p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={resetCalculator}
                              className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer"
                            >
                              Reset
                            </button>
                            {/* ✅ UPDATED: Redirects to Marketplace */}
                            <Link href="/materials" onClick={() => setIsOpen(false)}>
                              <button className="flex-[2] flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-orange-500/20">
                                Order Materials <ArrowRight className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </div>

                        {/* Breakdown */}
                        <div className="p-4 bg-muted/30 rounded-xl border border-border text-sm">
                          <p className="font-medium mb-2">Calculation Breakdown:</p>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            <li>• Material: {results.material}</li>
                            <li>• Density: {materials[selectedMaterial].density} tons/m³</li>
                            <li>• Total Weight: {results.tons} tons</li>
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!results && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calculator className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Enter dimensions above to see calculations</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}