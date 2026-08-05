"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Home, Package, Truck, MapPin, Settings, 
  LayoutDashboard, Moon, Sun, MessageCircle,
  ArrowRight, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: "Navigation" | "Quick Actions" | "Appearance";
  href?: string;
  action?: () => void;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // ✅ UPDATED: Exact list requested by the client
  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: "home", label: "Home", description: "Go to homepage", icon: Home, category: "Navigation", href: "/" },
    { id: "materials", label: "Materials", description: "Browse construction materials", icon: Package, category: "Navigation", href: "/materials" },
    { id: "services", label: "Services", description: "View our logistics services", icon: Truck, category: "Navigation", href: "/services" },
    { id: "dashboard", label: "Dashboard", description: "Go to your dashboard", icon: LayoutDashboard, category: "Navigation", href: "/dashboard" },
    { id: "tracking", label: "Live Tracking", description: "Track active delivery", icon: MapPin, category: "Navigation", href: "/dashboard/tracking" },
    { id: "settings", label: "Settings", description: "Account preferences", icon: Settings, category: "Navigation", href: "/dashboard/settings" },
    
    // Quick Actions
    { 
      id: "support", 
      label: "Contact Support", 
      description: "Open live chat", 
      icon: MessageCircle, 
      category: "Quick Actions", 
      action: () => {
        const chatButton = document.querySelector<HTMLButtonElement>('[aria-label="Open chat"]');
        chatButton?.click();
      }
    },
    
    // Appearance
    { 
      id: "theme", 
      label: "Toggle Theme", 
      description: mounted ? `Current: ${theme === "dark" ? "Dark" : "Light"} mode` : "Toggle dark/light mode", 
      icon: theme === "dark" ? Sun : Moon, 
      category: "Appearance", 
      action: () => setTheme(theme === "dark" ? "light" : "dark") 
    },
  ], [theme, setTheme, mounted]);

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(q) ||
      cmd.description?.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  }, [query, commands]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Flatten for keyboard navigation
  const flatCommands = useMemo(() => {
    return Object.values(groupedCommands).flat();
  }, [groupedCommands]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open/close with Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle command selection
  const handleSelect = (cmd: CommandItem) => {
    setIsOpen(false);
    if (cmd.href) {
      router.push(cmd.href);
    } else if (cmd.action) {
      cmd.action();
    }
  };

  // Handle keyboard navigation within the modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatCommands.length === 0) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % flatCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatCommands.length) % flatCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatCommands[selectedIndex]) {
        handleSelect(flatCommands[selectedIndex]);
      }
    }
  };

  return (
    <>
      {/* 🎯 Floating Trigger Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-3 md:px-4 py-2.5 glass rounded-full border border-border hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all cursor-pointer group"
        title="Command Menu (K)"
      >
        <Search className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium text-foreground hidden md:inline">Search</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded text-muted-foreground">
          ⌘K
        </kbd>
      </motion.button>

      {/* 🎨 Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-[10%] md:top-[15%] -translate-x-1/2 z-[101] w-[95%] md:max-w-xl pointer-events-none px-4"
            >
              <div className="glass rounded-2xl border border-border shadow-2xl overflow-hidden pointer-events-auto">
                
                {/* Search Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                  <Search className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a command or search..."
                    className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                  {flatCommands.length === 0 ? (
                    <div className="py-12 text-center">
                      <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">No results found for &quot;{query}&quot;</p>
                      <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                    </div>
                  ) : (
                    Object.entries(groupedCommands).map(([category, items]) => (
                      <div key={category} className="mb-2">
                        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {category}
                        </div>
                        {items.map((cmd) => {
                          const flatIndex = flatCommands.indexOf(cmd);
                          const isSelected = flatIndex === selectedIndex;
                          const Icon = cmd.icon;
                          
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => handleSelect(cmd)}
                              onMouseEnter={() => setSelectedIndex(flatIndex)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                                isSelected 
                                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" 
                                  : "hover:bg-muted text-foreground"
                              }`}
                            >
                              <div className={`p-1.5 rounded-md flex-shrink-0 ${isSelected ? "bg-orange-500/20" : "bg-muted"}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{cmd.label}</p>
                                {cmd.description && (
                                  <p className="text-xs text-muted-foreground truncate">{cmd.description}</p>
                                )}
                              </div>
                              {cmd.href && isSelected && (
                                <ArrowRight className="w-4 h-4 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer with Keyboard Hints */}
                <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 font-mono bg-background border border-border rounded text-[10px]">↑↓</kbd>
                      <span className="hidden sm:inline">Navigate</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 font-mono bg-background border border-border rounded text-[10px]">↵</kbd>
                      <span className="hidden sm:inline">Select</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 font-mono bg-background border border-border rounded text-[10px]">esc</kbd>
                      <span className="hidden sm:inline">Close</span>
                    </span>
                  </div>
                  <span className="text-[10px] opacity-70 hidden sm:inline">EWA Logistics</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}