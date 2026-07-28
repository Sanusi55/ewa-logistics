"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Package, Truck, DollarSign, AlertCircle, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "@/app/actions/notifications";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const supabase = createClient();

  // ✅ Fetch notifications function
  const fetchNotifications = async () => {
    const result = await getUserNotifications(15);
    if (!result.error) {
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    }
    setIsLoading(false);
  };

  // ✅ Handle Realtime subscription
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && isMounted) {
        setUserId(user.id);
        fetchNotifications();

        // ✅ FIX: Create a truly unique channel name to prevent Supabase caching conflicts
        // This guarantees we never try to add .on() to an already-subscribed channel
        const channelName = `notifications-${user.id}-${Date.now()}`;
        
        const channel = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${user.id}`, 
            },
            () => {
              if (isMounted) {
                fetchNotifications(); // Refresh list when new notification arrives
              }
            }
          )
          .subscribe();

        channelRef.current = channel;
      } else {
        if (isMounted) setIsLoading(false);
      }
    }
    
    init();

    // ✅ Proper cleanup function
    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [supabase]);

  // ✅ Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkAsRead(id: string) {
    await markNotificationAsRead(id);
    fetchNotifications();
  }

  async function handleMarkAllAsRead() {
    await markAllNotificationsAsRead();
    fetchNotifications();
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "order": return Package;
      case "delivery": return Truck;
      case "bid": return DollarSign;
      case "warning": return AlertCircle;
      case "error": return AlertCircle;
      case "success": return Check;
      default: return Info;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "order": return "bg-orange-500/10 text-orange-500";
      case "delivery": return "bg-blue-500/10 text-blue-500";
      case "bid": return "bg-green-500/10 text-green-500";
      case "warning": return "bg-yellow-500/10 text-yellow-500";
      case "error": return "bg-red-500/10 text-red-500";
      case "success": return "bg-green-500/10 text-green-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Don't render anything if not logged in
  if (!userId && !isLoading) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] glass rounded-2xl border border-border shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-orange-500 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll be notified about orders and deliveries here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((notification) => {
                    const Icon = getIcon(notification.type);
                    const color = getColor(notification.type);
                    const Content = (
                      <div 
                        className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notification.is_read ? "bg-orange-500/5" : ""
                        }`}
                        onClick={() => {
                          if (!notification.is_read) {
                            handleMarkAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg flex-shrink-0 h-fit ${color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-semibold ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                                {notification.title}
                              </p>
                              {!notification.is_read && (
                                <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1.5">
                              {formatTime(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );

                    if (notification.link) {
                      return (
                        <Link key={notification.id} href={notification.link} onClick={() => setIsOpen(false)}>
                          {Content}
                        </Link>
                      );
                    }

                    return <div key={notification.id}>{Content}</div>;
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border bg-muted/30">
                <Link 
                  href="/dashboard/notifications" 
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-orange-500 hover:underline font-medium flex items-center justify-center gap-1"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}