"use client";

import { X, Calendar, MapPin, User, Hash, School, ShieldAlert, Phone, Mail } from "lucide-react";
import { ItemFormData } from "./report-modal";

interface ItemDetailModalProps {
  isOpen: boolean;
  item: any;
  onClose: () => void;
  onClaim: (item: any) => void;
}

export default function ItemDetailModal({ isOpen, item, onClose, onClaim }: ItemDetailModalProps) {
  if (!isOpen || !item) return null;

  const isLost = item.type === "lost";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xl p-6 sm:p-8 text-neutral-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-all"
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
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-4">{item.title}</h2>

        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-6">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
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

        <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 text-xs sm:text-sm font-medium hover:bg-neutral-100 dark:hover:bg-white/5 transition-all"
          >
            Close
          </button>
          <button
            onClick={() => onClaim(item)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            {isLost ? "I Found This Item" : "Claim This Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

