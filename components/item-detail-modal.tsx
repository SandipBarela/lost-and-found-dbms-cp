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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 editorial-modal-backdrop animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto editorial-modal-container p-6 sm:p-8 text-[#1F2421]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-[#5A625E] hover:text-[#1F2421] hover:bg-[#F2ECE1] transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider font-semibold ${
            isLost 
              ? "badge-alert" 
              : "badge-verified"
          }`}>
            {item.type}
          </span>
          <span className="text-xs font-semibold badge-campus px-2.5 py-1 rounded-full">
            {item.category || "General"}
          </span>
          <span className={`text-xs font-mono px-2.5 py-1 rounded-full ${
            item.status === "Returned"
              ? "badge-verified font-bold"
              : "badge-campus"
          }`}>
            {item.status === "Returned" ? "Returned ✓" : (item.status || "In Safekeeping")}
          </span>
          {isOwner && (
            <span className="text-[11px] font-mono badge-alert px-2.5 py-0.5 rounded-full font-semibold">
              Your Report
            </span>
          )}
        </div>

        <h2 className="font-serif text-2xl font-bold tracking-[-0.025em] text-[#1F2421] mb-4">{item.title}</h2>

        <div className="aspect-video w-full rounded-xl overflow-hidden bg-[#F2ECE1] border border-[#CFC5B4] mb-6 relative">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80";
            }}
          />
        </div>

        <div className="space-y-4 text-sm text-[#5A625E]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white border border-[#E3DCD0] shadow-tactile-card">
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-[#D95D39] shrink-0" />
              <div>
                <p className="text-[11px] text-[#5A625E] uppercase font-mono">Location</p>
                <p className="font-medium text-xs sm:text-sm text-[#1F2421]">{item.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-[#D95D39] shrink-0" />
              <div>
                <p className="text-[11px] text-[#5A625E] uppercase font-mono">Reported Date</p>
                <p className="font-medium text-xs sm:text-sm text-[#1F2421] font-mono">{item.date}</p>
              </div>
            </div>

            {item.prnNumber && (
              <div className="flex items-center gap-2.5">
                <Hash className="h-4 w-4 text-[#2D5A4C] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#5A625E] uppercase font-mono">Student PRN</p>
                  <p className="font-mono text-xs sm:text-sm text-[#1F2421]">{item.prnNumber}</p>
                </div>
              </div>
            )}

            {item.division && (
              <div className="flex items-center gap-2.5">
                <School className="h-4 w-4 text-[#2D5A4C] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#5A625E] uppercase font-mono">Division / Dept</p>
                  <p className="font-medium text-xs sm:text-sm text-[#1F2421]">{item.division}</p>
                </div>
              </div>
            )}
          </div>

          {item.description && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[#D95D39] font-bold mb-1">Item Description</p>
              <p className="p-3.5 rounded-xl bg-white text-xs sm:text-sm leading-relaxed border border-[#E3DCD0] text-[#1F2421]">
                {item.description}
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E3DCD0]">
          
          {/* Delete Option for this item */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                confirmDelete
                  ? "bg-[#A83C1D] text-white shadow-xs animate-pulse"
                  : "badge-alert"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{confirmDelete ? "Click again to confirm delete" : "Delete Item"}</span>
            </button>
            {confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-[#5A625E] hover:underline cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
            >
              Close
            </button>

            {item.status === "Returned" ? (
              <div className="px-4 py-2 rounded-full badge-verified text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Returned & Closed</span>
              </div>
            ) : isLost ? (
              isOwner ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenMatch?.(item);
                  }}
                  className="btn-tactile-primary px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Find AI Matches</span>
                </button>
              ) : (
                <button
                  onClick={() => onClaim(item)}
                  className="btn-tactile-primary px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold cursor-pointer"
                >
                  I Found This Item
                </button>
              )
            ) : (
              !isOwner && (
                <button
                  onClick={() => onClaim(item)}
                  className="btn-tactile-primary px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold cursor-pointer"
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
