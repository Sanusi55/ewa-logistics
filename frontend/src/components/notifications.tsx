"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, AlertTriangle, Info, Package, Truck, DollarSign, X } from "lucide-react";

export type Notification = {
  id: string;
  type: "success" | "warning" | "info" | "order" | "payment";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon?: React.ReactNode;
};

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "New Order Received",
    message: "Order #ORD-5521 for 1-Inch Granite (5 Tons) is pending approval.",
    time: "2 min ago",
    read: false,
    icon: <Package className="w-4 h-4" />,
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Released",
    message: "$1,200.00 has been released to supplier for Order #ORD-5519.",
    time: "1 hour ago",
    read: false,
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    id: "3",
    type: "success",
    title: "Delivery Completed",
    message: "Driver Emmanuel O. delivered 10 Tons of Sharp Sand to Victoria Island.",
    time: "3 hours ago",
    read: true,
    icon: <Truck className="w-4 h-4" />,
  },
  {
    id: "4",
    type: "warning",
    title: "Low Stock Alert",
    message: "Stone Dust is running low (0 Tons remaining). Consider restocking.",
    time: "5 hours ago",
    read: true,
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  {
    id: "5",
    type: "info",
    title: "System Update",
    message: "New feature: Live GPS tracking is now available for all deliveries!",
    time: "1 day ago",
    read: true,
    icon: <Info className="w-4 h-4" />,
  },
];

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIconByType = (type: Notification["type"]) => {
    switch (type) {
      case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info": return <Info className="w-4 h-4 text-blue-500" />;
      case "order": return <Package className="w-4 h-4 text-purple-500" />;
      case "payment": return <DollarSign className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Button with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 md:w-96 glass rounded-xl shadow-xl border border-border z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No new notifications</p>
                </div>
              ) : (
                notifications.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !note.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => markAsRead(note.id)}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">{note.icon || getIconByType(note.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!note.read ? "text-foreground" : "text-muted-foreground"}`}>
                            {note.title}
                          </p>
                          {!note.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{note.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{note.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border text-center">
              <button className="text-xs text-primary hover:underline cursor-pointer">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}