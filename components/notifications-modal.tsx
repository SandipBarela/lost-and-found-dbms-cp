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
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 editorial-modal-backdrop animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl h-[85vh] max-h-[660px] editorial-modal-container flex flex-col text-[#1F2421] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Undo Toast */}
        {undoToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#1F2421] text-white border border-[#CFC5B4] shadow-tactile-modal text-xs font-semibold animate-in slide-in-from-top-3">
            <span>{undoToast.message}</span>
            <button
              onClick={() => {
                undoToast.undo();
                setUndoToast(null);
              }}
              className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FAF7F2]/20 hover:bg-[#FAF7F2]/30 text-[#FAF7F2] font-bold cursor-pointer"
            >
              <Undo2 className="h-3 w-3" />
              <span>Undo</span>
            </button>
          </div>
        )}

        {/* Header with Explicit Closing Option */}
        <div className="p-5 sm:p-6 border-b border-[#E3DCD0] flex items-center justify-between shrink-0 bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#F2ECE1] text-[#D95D39] border border-[#E3DCD0] flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold tracking-tight text-[#1F2421]">
                  Instant Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="badge-alert px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5A625E] mt-0.5 font-sans">
                Automated campus alerts & matching updates
              </p>
            </div>
          </div>

          {/* EXPLICIT CLOSING BUTTON */}
          <button
            onClick={onClose}
            aria-label="Close notification panel"
            className="btn-tactile-secondary text-xs flex items-center gap-1.5"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Action Controls & Filters */}
        <div className="px-5 sm:px-6 py-2.5 border-b border-[#E3DCD0] flex flex-wrap items-center justify-between gap-2 bg-[#F2ECE1]/50 shrink-0 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                filter === "all" 
                  ? "btn-tactile-primary py-1 px-3" 
                  : "bg-white border border-[#CFC5B4] text-[#5A625E] hover:text-[#1F2421]"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                filter === "unread" 
                  ? "btn-tactile-primary py-1 px-3" 
                  : "bg-white border border-[#CFC5B4] text-[#5A625E] hover:text-[#1F2421]"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("matches")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                filter === "matches" 
                  ? "btn-tactile-primary py-1 px-3" 
                  : "bg-white border border-[#CFC5B4] text-[#5A625E] hover:text-[#1F2421]"
              }`}
            >
              Match Alerts
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="btn-tactile-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={clearAll}
              className="badge-alert text-[11px] py-1 px-2.5 rounded-lg border font-medium flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto min-h-0 p-5 sm:p-6 space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center text-[#5A625E]">
              <Bell className="h-10 w-10 mx-auto text-[#5A625E] mb-2 stroke-1" />
              <p className="font-serif text-base font-semibold text-[#1F2421]">No notifications in this view.</p>
              <p className="text-xs text-[#5A625E] mt-0.5">You are completely up to date.</p>
            </div>
          ) : (
            filteredNotifs.map((n, idx) => (
              <div
                key={`notif-${n.id}-${idx}`}
                onClick={() => handleCardClick(n)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative group shadow-tactile-card bg-white ${
                  !n.read
                    ? "border-[1.5px] border-[#D95D39] ring-1 ring-[#D95D39]/30"
                    : "border-[#E3DCD0] hover:border-[#CFC5B4]"
                }`}
              >
                {!n.read && (
                  <span className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-[#D95D39] animate-pulse" />
                )}
                <div className="flex items-start gap-3.5">
                  <div className={`h-9 w-9 rounded-lg shrink-0 flex items-center justify-center font-bold ${
                    n.type === "match"
                      ? "badge-campus"
                      : n.type === "handover"
                      ? "badge-verified"
                      : "badge-campus"
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
                    <h4 className="text-sm font-semibold text-[#1F2421] mb-0.5 font-sans">
                      {n.title}
                    </h4>
                    <p className="text-xs text-[#5A625E] leading-relaxed mb-2 font-sans">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between text-xs font-mono text-[#5A625E] mt-2">
                      <span className="flex items-center gap-1 text-[11px] text-[#5A625E]">
                        <Clock className="h-3 w-3" /> {n.timestamp}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(n);
                        }}
                        className="text-[#D95D39] hover:text-[#C04B29] text-xs font-bold transition-all cursor-pointer underline flex items-center gap-1"
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
        <div className="p-3.5 px-5 sm:px-6 border-t border-[#E3DCD0] bg-[#FAF7F2] shrink-0 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#5A625E] font-medium">
            <Smartphone className="h-4 w-4 text-[#5A625E] shrink-0" />
            <span className="text-xs">Instant SMS alerts:</span>
            <button
              onClick={() => setSmsAlertsEnabled(!smsAlertsEnabled)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                smsAlertsEnabled
                  ? "badge-verified font-bold"
                  : "badge-campus"
              }`}
            >
              {smsAlertsEnabled ? "ENABLED" : "DISABLED"}
            </button>
          </div>

          {/* SECOND EXPLICIT CLOSE OPTION AT FOOTER */}
          <button
            onClick={onClose}
            className="btn-tactile-secondary text-xs"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
