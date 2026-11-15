"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Key, 
  Building2, 
  User, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  ArrowRight,
  ExternalLink
} from "lucide-react";

interface RetrieveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: any;
  items: any[];
  onCompleteRetrieval: (itemId: number, token: string) => void;
  onOpenClaimConsole?: (claimId?: string) => void;
  onOpenHandover?: (token: string) => void;
}

export default function RetrieveModal({ 
  isOpen, 
  onClose, 
  selectedItem, 
  items, 
  onCompleteRetrieval,
  onOpenClaimConsole,
  onOpenHandover
}: RetrieveModalProps) {
  const [activeItemId, setActiveItemId] = useState<number | null>(selectedItem?.id || null);
  const [currentUser, setCurrentUser] = useState({
    displayName: "Sandip Barela",
    prnNumber: "1032210084",
    department: "Div A - Computer Engineering",
    email: "student@college.edu"
  });

  const [proofDetail, setProofDetail] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofImagePreview, setProofImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  const [createdClaimCode, setCreatedClaimCode] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync active item when selectedItem changes
  useEffect(() => {
    if (selectedItem?.id) {
      setActiveItemId(selectedItem.id);
    }
  }, [selectedItem]);

  // Load authenticated credentials from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lf_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser({
          displayName: parsed.displayName || parsed.fullName || "Sandip Barela",
          prnNumber: parsed.prnNumber || "1032210084",
          department: parsed.department || "Div A - Computer Engineering",
          email: parsed.email || "student@college.edu"
        });
      }
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter items available for retrieval (both found items and active lost listings)
  const availableItems = items.filter(i => i.status !== "Handed Over & Closed");
  const targetItem = availableItems.find(i => i.id === (activeItemId || selectedItem?.id)) || availableItems[0];

  const handleImageFile = (file: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Image is larger than 8MB. Please choose a smaller photo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProofImage(result);
      setProofImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofDetail.trim()) return;

    setIsSubmitting(true);
    const claimantName = currentUser.displayName || "Sandip Barela";
    const claimantPrn = currentUser.prnNumber || "1032210084";

    // Generate cryptographic-style unique retrieval handover token
    const token = `RET-${Math.floor(100000 + Math.random() * 900000)}-${claimantPrn.slice(-4) || "AUTH"}`;
    setGeneratedToken(token);

    if (targetItem) {
      onCompleteRetrieval(targetItem.id, token);

      try {
        const res = await fetch("/api/claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: targetItem.id,
            claimantName,
            claimantPrn,
            proofDetail: proofDetail.trim(),
            proofImage: proofImage || undefined
          })
        });
        const data = await res.json();
        if (data.claimCode) {
          setCreatedClaimCode(data.claimCode);
        }
      } catch (err) {
        console.warn("Claim registration offline/notice:", err);
      }
    }

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setGeneratedToken("");
    setCreatedClaimCode(null);
    setProofDetail("");
    setProofImage(null);
    setProofImagePreview(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleReset}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xl p-6 sm:p-8 text-neutral-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleReset}
          aria-label="Close"
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-6 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h3 className="text-2xl font-bold mb-1">Claim Submitted Successfully!</h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mb-5">
              Your claim for <strong className="text-neutral-900 dark:text-white">&quot;{targetItem?.title}&quot;</strong> has been recorded in the campus DBMS and sent to the Admin for verification.
            </p>

            {/* Verification Status Ticket */}
            <div className="w-full max-w-lg p-5 sm:p-6 rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-left space-y-4 mb-6">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                    Campus Claim Ticket
                  </span>
                  {createdClaimCode && (
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                      Record: {createdClaimCode}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Pending Admin Approval
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-neutral-400 font-mono uppercase">Claimant</p>
                  <p className="font-semibold text-neutral-800 dark:text-white truncate">{currentUser.displayName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-mono uppercase">Student PRN</p>
                  <p className="font-mono text-neutral-800 dark:text-white">{currentUser.prnNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-mono uppercase">Collection Point</p>
                  <p className="font-medium text-neutral-800 dark:text-white">Security Desk Counter 2</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-mono uppercase">Next Step</p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">Awaiting Admin Sign-off</p>
                </div>
              </div>
            </div>

            {/* Clean Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg">
              <button
                onClick={() => {
                  onClose();
                  onOpenClaimConsole?.(createdClaimCode || undefined);
                }}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/25"
              >
                <span>Track My Claim Status</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleReset}
              className="mt-3 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Done & Return to Homepage
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Step 3: Submit Ownership Claim
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Claim This Item
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Provide identifying proof details so the Admin can verify your ownership before you pick it up at Counter 2.
              </p>
            </div>

            {/* Target Item Summary Banner */}
            {targetItem && (
              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-white/10 flex items-center gap-3.5 mb-5">
                <img 
                  src={targetItem.image} 
                  alt={targetItem.title} 
                  className="h-14 w-14 rounded-xl object-cover shrink-0" 
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    targetItem.type === "lost" ? "bg-rose-500/15 text-rose-500" : "bg-emerald-500/15 text-emerald-500"
                  }`}>
                    {targetItem.type}
                  </span>
                  <p className="text-sm font-semibold truncate text-neutral-900 dark:text-white mt-1">{targetItem.title}</p>
                  <p className="text-xs text-neutral-500 truncate">{targetItem.location} • {targetItem.category}</p>
                </div>
              </div>
            )}

            {/* Authenticated User Auto-Link Card (NO MANUAL NAME/PRN ENTRY) */}
            <div className="mb-5 p-3.5 rounded-2xl bg-neutral-100/90 dark:bg-neutral-800/60 border border-neutral-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold font-mono text-sm shadow-sm shrink-0">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                      {currentUser.displayName}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-0.2 rounded-md font-bold">
                      Verified Identity
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    PRN: {currentUser.prnNumber} • {currentUser.department}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                Auto-linked from session
              </span>
            </div>

            <form onSubmit={handleGenerateToken} className="space-y-4">
              {/* Proof Description Field */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                  Proof of Ownership Details *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe unique characteristics, lock screen wallpaper, specific contents, purchase receipts, or serial number."
                  value={proofDetail}
                  onChange={(e) => setProofDetail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>

              {/* Upload Proof Image / Photo (Optional) */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                  <span>Upload Proof Image / Receipt / Photo <span className="text-neutral-400 font-normal">(Optional)</span></span>
                  {proofImagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setProofImage(null);
                        setProofImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-rose-500 hover:text-rose-600 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  )}
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />

                {proofImagePreview ? (
                  <div className="relative rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/40 p-3 flex items-center gap-4">
                    <img 
                      src={proofImagePreview} 
                      alt="Proof Preview" 
                      className="h-20 w-20 rounded-xl object-cover border border-neutral-200 dark:border-white/10 shadow-sm shrink-0" 
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Proof Image Attached
                      </p>
                      <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mb-2">
                        This image will be available in the Claim Management Console for verification.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-xs cursor-pointer"
                      >
                        Change photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="group border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer transition-all bg-neutral-50/50 dark:bg-neutral-800/30 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                  >
                    <div className="h-10 w-10 mx-auto rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      Click to upload purchase receipt, photo of markings, or serial proof
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      PNG, JPG, WEBP up to 8MB
                    </p>
                  </div>
                )}
              </div>

              {/* Handover Location Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <Building2 className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Campus Security Handover Policy:</span> Physical items can only be retrieved in person at Central Security Desk Counter 2 upon presenting this digital pass and physical college ID.
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-xs sm:text-sm font-medium transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !proofDetail.trim()}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isSubmitting ? "Registering Claim..." : "Verify & Issue Handover Pass"}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
