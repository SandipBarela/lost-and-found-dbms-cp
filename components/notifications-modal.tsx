"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  CheckCheck, 
  Trash2, 
  Clock, 
  Smartphone,
  Undo2
} from "lucide-react";

export interface NotificationItem {
  id: string;
  type: "match" | "handover" | "system" | "item_found";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  token?: string;
  itemId?: number;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "match",
    title: "AI Match Alert: 92% Match Found!",
    message: "A 'Smart Watch Silver Case' was registered at Library 2nd Floor matching your reported Apple Watch SE.",
    timestamp: "5 minutes ago",
    read: false,
    itemId: 2
  },
  {
    id: "notif-2",
    type: "handover",
    title: "Handover Token Generated",
    message: "Security Handover Pass 'RET-482910-0084' is approved for pick up at Central Security Desk Counter 2.",
    timestamp: "25 minutes ago",
    read: false,
    token: "RET-482910-0084"
  },
  {
    id: "notif-3",
    type: "item_found",
    title: "New Item Handed In: Dell Charger",
    message: "A 130W USB-C Dell adapter was registered at Engineering Hall B-104. Check if this is yours.",
    timestamp: "2 hours ago",
    read: true,
    itemId: 3
  },
  {
    id: "notif-4",
    type: "system",
    title: "Database Sync Successful",
    message: "Campus database synchronized 4 new lost and found logs across lecture halls.",
    timestamp: "Yesterday",
    read: true
  }
];

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMatch?: () => void;
  onOpenHandover?: () => void;
  onOpenClaim?: (token?: string) => void;
  onViewItem?: (itemId?: number) => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  onOpenMatch,
  onOpenHandover,
  onOpenClaim,
  onViewItem
}: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread" | "matches">("all");
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [undoToast, setUndoToast] = useState<{ message: string; undo: () => void } | null>(null);

  // Fetch real notifications from MySQL notification table
  useEffect(() => {
    if (isOpen) {
      fetch("/api/notifications")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.notifications && data.notifications.length > 0) {
            setNotifications(data.notifications);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showUndo = (message: string, undo: () => void) => {
    setUndoToast({ message, undo });
    setTimeout(() => setUndoToast(null), 5000);
  };

  const markAllRead = () => {
    const prev = [...notifications];
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" })
    }).catch(() => {});
    showUndo("Marked all as read.", () => setNotifications(prev));
  };

  const clearAll = () => {
    const prev = [...notifications];
    setNotifications([]);
    showUndo("Cleared all notifications.", () => setNotifications(prev));
  };

  const handleCardClick = (notif: NotificationItem) => {
    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
    onClose();

    if (notif.type === "match") {
      if (onOpenMatch) onOpenMatch();
      else if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("reunite:open-match"));
    } else if (notif.type === "handover" || notif.token) {
      if (onOpenClaim) onOpenClaim(notif.token);
      else if (onOpenHandover) onOpenHandover();
      else if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("reunite:open-claims", { detail: { token: notif.token } }));
      }
    } else if (notif.itemId) {
      if (onViewItem) onViewItem(notif.itemId);
      else if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("reunite:view-item", { detail: { itemId: notif.itemId } }));
      }
    } else {
      if (onOpenClaim) onOpenClaim();
      else if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("reunite:open-claims"));
      }
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "matches") return n.type === "match";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl h-[85vh] max-h-[660px] rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xl flex flex-col text-neutral-900 dark:text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Undo Toast */}
        {undoToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border border-neutral-700 shadow-xl text-xs font-semibold animate-in slide-in-from-top-3">
            <span>{undoToast.message}</span>
            <button
              onClick={() => {
                undoToast.undo();
                setUndoToast(null);
              }}
              className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/20 dark:bg-neutral-900/20 hover:bg-white/30 text-amber-300 dark:text-amber-600 font-bold cursor-pointer"
            >
              <Undo2 className="h-3 w-3" />
              <span>Undo</span>
            </button>
          </div>
        )}

        {/* Header with Explicit Closing Option */}
        <div className="p-5 sm:p-6 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Instant Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Automated campus alerts & matching updates
              </p>
            </div>
          </div>

          {/* EXPLICIT CLOSING BUTTON */}
          <button
            onClick={onClose}
            aria-label="Close notification panel"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Action Controls & Filters */}
        <div className="px-5 sm:px-6 py-2.5 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 bg-neutral-50 dark:bg-neutral-900/80 shrink-0 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer text-xs ${
                filter === "all" 
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm" 
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer text-xs ${
                filter === "unread" 
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm" 
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("matches")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer text-xs ${
                filter === "matches" 
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm" 
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Match Alerts
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium transition-colors cursor-pointer text-[11px]"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium transition-colors cursor-pointer text-[11px]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto min-h-0 p-5 sm:p-6 space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center text-neutral-500">
              <Bell className="h-10 w-10 mx-auto text-neutral-400 dark:text-neutral-600 mb-2 stroke-1" />
              <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">No notifications in this view.</p>
              <p className="text-xs text-neutral-500 mt-0.5">You are completely up to date.</p>
            </div>
          ) : (
            filteredNotifs.map((n, idx) => (
              <div
                key={`notif-${n.id}-${idx}`}
                onClick={() => handleCardClick(n)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                  !n.read
                    ? "border-amber-500/30 bg-amber-500/[0.04] dark:bg-amber-500/[0.06] shadow-sm hover:border-amber-500/50"
                    : "border-neutral-200 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 bg-white dark:bg-neutral-850"
                }`}
              >
                {!n.read && (
                  <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                )}
                <div className="flex items-start gap-3.5">
                  <div className={`h-9 w-9 rounded-xl shrink-0 flex items-center justify-center font-bold ${
                    n.type === "match"
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                      : n.type === "handover"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                  }`}>
                    {n.type === "match" ? (
                      <Sparkles className="h-4 w-4" />
                    ) : n.type === "handover" ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-0.5">
                      {n.title}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-2">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mt-2">
                      <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                        <Clock className="h-3 w-3" /> {n.timestamp}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(n);
                        }}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 text-xs font-bold transition-all cursor-pointer underline flex items-center gap-1"
                      >
                        {n.type === "match" ? "Open Match Engine →" : n.type === "handover" ? "View Pass Details →" : "View Details →"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Bar: SMS Alerts and Bottom Close Button */}
        <div className="p-3.5 px-5 sm:px-6 border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 shrink-0 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-medium">
            <Smartphone className="h-4 w-4 text-neutral-500 shrink-0" />
            <span className="text-xs">Instant SMS alerts:</span>
            <button
              onClick={() => setSmsAlertsEnabled(!smsAlertsEnabled)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                smsAlertsEnabled
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
              }`}
            >
              {smsAlertsEnabled ? "ENABLED" : "DISABLED"}
            </button>
          </div>

          {/* SECOND EXPLICIT CLOSE OPTION AT FOOTER */}
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-all cursor-pointer shadow-sm"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
