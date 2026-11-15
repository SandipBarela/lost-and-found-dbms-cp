"use client";

import { useState } from "react";
import { 
  X, 
  Calendar, 
  MapPin, 
  User, 
  Hash, 
  School, 
  ShieldAlert, 
  Phone, 
  Mail, 
  Trash2, 
  Sparkles, 
  CheckCircle2 
} from "lucide-react";

interface ItemDetailModalProps {
  isOpen: boolean;
  item: any;
  onClose: () => void;
  onClaim: (item: any) => void;
  onDelete?: (item: any) => void;
  onOpenMatch?: (item: any) => void;
  isOwner?: boolean;
}

export default function ItemDetailModal({ 
  isOpen, 
  item, 
  onClose, 
  onClaim, 
  onDelete, 
  onOpenMatch, 
  isOwner = false 
}: ItemDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !item) return null;

  const isLost = item.type === "lost";

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete?.(item);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xl p-6 sm:p-8 text-neutral-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold ${
            isLost 
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" 
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          }`}>
            {item.type}
          </span>
          <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
            {item.category || "General"}
          </span>
          <span className={`text-xs font-mono px-2.5 py-1 rounded-lg ${
            item.status === "Returned"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
              : "text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800"
          }`}>
            {item.status === "Returned" ? "Returned ✓" : (item.status || "In Safekeeping")}
          </span>
          {isOwner && (
            <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-semibold">
              Your Report
            </span>
          )}
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-4">{item.title}</h2>

        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-6 relative">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80";
            }}
          />
        </div>

        <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-[11px] text-neutral-400 uppercase font-mono">Location</p>
                <p className="font-medium text-xs sm:text-sm text-neutral-800 dark:text-white">{item.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-[11px] text-neutral-400 uppercase font-mono">Reported Date</p>
                <p className="font-medium text-xs sm:text-sm text-neutral-800 dark:text-white">{item.date}</p>
              </div>
            </div>

            {item.prnNumber && (
              <div className="flex items-center gap-2.5">
                <Hash className="h-4 w-4 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-[11px] text-neutral-400 uppercase font-mono">Student PRN</p>
                  <p className="font-mono text-xs sm:text-sm text-neutral-800 dark:text-white">{item.prnNumber}</p>
                </div>
              </div>
            )}

            {item.division && (
              <div className="flex items-center gap-2.5">
                <School className="h-4 w-4 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-[11px] text-neutral-400 uppercase font-mono">Division / Dept</p>
                  <p className="font-medium text-xs sm:text-sm text-neutral-800 dark:text-white">{item.division}</p>
                </div>
              </div>
            )}
          </div>

          {item.description && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">Item Description</p>
              <p className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 text-xs sm:text-sm leading-relaxed border border-neutral-200/50 dark:border-white/5">
                {item.description}
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-200 dark:border-white/10">
          
          {/* Delete Option for this item */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                confirmDelete
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse"
                  : "bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/20"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{confirmDelete ? "Click again to confirm delete" : "Delete Item"}</span>
            </button>
            {confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-neutral-400 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-white/10 text-xs sm:text-sm font-medium hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              Close
            </button>

            {item.status === "Returned" ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Returned & Closed</span>
              </div>
            ) : isLost ? (
              isOwner ? (
                /* The user reported this lost item: DO NOT show "I Found This Item"! */
                <button
                  onClick={() => {
                    onClose();
                    onOpenMatch?.(item);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-sky-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Find AI Matches</span>
                </button>
              ) : (
                /* Third-party person viewing another student's lost item */
                <button
                  onClick={() => onClaim(item)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  I Found This Item
                </button>
              )
            ) : (
              /* Found item */
              !isOwner && (
                <button
                  onClick={() => onClaim(item)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  Claim This Item
                </button>
              )
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
