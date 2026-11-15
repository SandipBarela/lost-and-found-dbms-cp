"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ShieldCheck, 
  Filter, 
  Search, 
  User, 
  FileText, 
  ArrowRight,
  Sparkles,
  Check,
  Building2,
  Key,
  Calendar,
  PackageCheck
} from "lucide-react";

export interface Claim {
  id: string;
  claimantName: string;
  prnNumber: string;
  itemTitle: string;
  itemId: number;
  category: string;
  proofDetail: string;
  date: string;
  status: "Pending Review" | "Verified & Approved" | "Handover Scheduled" | "Returned" | "Handover Completed" | "Rejected";
  token?: string;
  image?: string;
  proofImage?: string;
}

const INITIAL_CLAIMS: Claim[] = [
  {
    id: "CLM-2026-081",
    claimantName: "Sandip Barela",
    prnNumber: "1032210084",
    itemTitle: "Apple Watch SE (Silver)",
    itemId: 1,
    category: "Electronics",
    proofDetail: "Scratch near right corner of glass; serial number ending in 98X4.",
    date: "10 mins ago",
    status: "Verified & Approved",
    token: "RET-482910-0084",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "CLM-2026-082",
    claimantName: "Aarav Sharma",
    prnNumber: "1032210412",
    itemTitle: "Black Leather Bifold Wallet",
    itemId: 2,
    category: "ID Cards & Wallets",
    proofDetail: "Contains Pune metro pass and college gym card with roll 42.",
    date: "1 hour ago",
    status: "Pending Review",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "CLM-2026-083",
    claimantName: "Rohan Kulkarni",
    prnNumber: "1032210156",
    itemTitle: "Honda Car Key with Dorm FOB",
    itemId: 4,
    category: "Keys & Badges",
    proofDetail: "Red woven lanyard with dorm room key 204 attached.",
    date: "Yesterday",
    status: "Handover Completed",
    token: "RET-912384-0156",
    image: "https://images.unsplash.com/photo-1666346166849-8443c47f50fa?auto=format&fit=crop&w=600&q=80"
  }
];

interface ClaimManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClaimId?: string | null;
  onOpenHandover?: (token: string) => void;
  onClaimStatusChange?: (claimId: string, newStatus: Claim["status"], token?: string) => void;
}

export default function ClaimManagementModal({ 
  isOpen, 
  onClose, 
  initialClaimId,
  onOpenHandover,
  onClaimStatusChange 
}: ClaimManagementModalProps) {
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(claims[0]);
  const [actionNotice, setActionNotice] = useState<{ message: string; undo?: () => void } | null>(null);

  // Load claims from MySQL review and claim tables
  useEffect(() => {
    if (isOpen) {
      fetch("/api/claims")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.claims && data.claims.length > 0) {
            setClaims(data.claims);
            if (initialClaimId) {
              const matched = data.claims.find((c: Claim) => c.id.toUpperCase() === initialClaimId.toUpperCase());
              if (matched) {
                setSelectedClaim(matched);
                return;
              }
            }
            setSelectedClaim(data.claims[0]);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, initialClaimId]);

  useEffect(() => {
    if (initialClaimId && claims.length > 0) {
      const matched = claims.find((c: Claim) => c.id.toUpperCase() === initialClaimId.toUpperCase());
      if (matched) {
        setSelectedClaim(matched);
      }
    }
  }, [initialClaimId, claims]);

  if (!isOpen) return null;

  const showNotice = (message: string, undo?: () => void) => {
    setActionNotice({ message, undo });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleUpdateStatus = (id: string, newStatus: Claim["status"]) => {
    const previousClaims = [...claims];
    let generatedToken: string | undefined = undefined;
    const updated = claims.map(c => {
      if (c.id === id) {
        generatedToken = c.token || `RET-${Math.floor(100000 + Math.random() * 900000)}-${c.prnNumber.slice(-4)}`;
        return {
          ...c,
          status: newStatus,
          token: (newStatus === "Verified & Approved" || newStatus === "Handover Completed") ? generatedToken : c.token
        };
      }
      return c;
    });

    setClaims(updated);
    const active = updated.find(c => c.id === id) || null;
    setSelectedClaim(active);

    // Persist status change to MySQL review & item_hand_over tables
    fetch("/api/claims", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId: id, status: newStatus })
    }).catch(() => {});

    showNotice(
      `Claim ${id} status updated to "${newStatus}".`,
      () => {
        setClaims(previousClaims);
        const restored = previousClaims.find(c => c.id === id) || null;
        setSelectedClaim(restored);
        showNotice(`Action reversed: Claim ${id} restored.`);
      }
    );

    onClaimStatusChange?.(id, newStatus, generatedToken);
  };

  const filteredClaims = claims.filter(c => {
    let matchesFilter = true;
    if (statusFilter === "Approved") {
      matchesFilter = c.status === "Verified & Approved" || c.status === "Handover Scheduled" || c.status === "Returned" || c.status === "Handover Completed";
    } else if (statusFilter === "Rejected") {
      matchesFilter = c.status === "Rejected";
    } else if (statusFilter === "Pending") {
      matchesFilter = c.status === "Pending Review";
    }

    const matchesSearch = searchQuery === "" || 
      c.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.prnNumber.includes(searchQuery) ||
      c.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl h-[90vh] max-h-[850px] overflow-hidden rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xl flex flex-col text-neutral-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Clear Close Button */}
        <div className="p-5 sm:p-6 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Claim Tracking
              </span>
              <span className="text-xs text-neutral-500 font-mono hidden sm:inline">Live Student Status</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">My Claims & Pickup Status</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Claim Console"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Action notification banner with UNDO Action */}
        {actionNotice && (
          <div className="px-6 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{actionNotice.message}</span>
            </div>
            {actionNotice.undo && (
              <button
                onClick={() => {
                  actionNotice.undo?.();
                  setActionNotice(null);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                <span>Undo</span>
              </button>
            )}
          </div>
        )}

        {/* Main Body - Fixed 2-Column Responsive Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: Claims List */}
          <div className="md:col-span-5 p-4 sm:p-5 border-r border-neutral-200 dark:border-white/10 flex flex-col h-full overflow-hidden">
            {/* Filter and Search Bar */}
            <div className="space-y-2.5 mb-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search PRN, name, claim ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {[
                  { key: "All", label: "All", activeClass: "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900" },
                  { key: "Approved", label: "Approved", activeClass: "bg-emerald-600 text-white shadow-sm" },
                  { key: "Pending", label: "Pending", activeClass: "bg-amber-600 text-white shadow-sm" },
                  { key: "Rejected", label: "Rejected", activeClass: "bg-rose-600 text-white shadow-sm" },
                ].map(({ key, label, activeClass }) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
                      statusFilter === key
                        ? activeClass
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Claims List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredClaims.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400">
                  No claims match the filter criteria.
                </div>
              ) : (
                filteredClaims.map((claim) => {
                  const isSelected = selectedClaim?.id === claim.id;
                  return (
                    <div
                      key={claim.id}
                      onClick={() => setSelectedClaim(claim)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-purple-600 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-sm ring-1 ring-purple-500"
                          : "border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 bg-neutral-50/40 dark:bg-neutral-800/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[11px] font-mono font-bold text-neutral-800 dark:text-white">
                          {claim.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${
                          claim.status === "Returned" || claim.status === "Handover Completed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : claim.status === "Handover Scheduled"
                            ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                            : claim.status === "Verified & Approved"
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                            : claim.status === "Pending Review"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        }`}>
                          {claim.status === "Handover Completed" ? "Returned ✓" : claim.status}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold truncate">{claim.itemTitle}</h4>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1 font-mono">
                          <User className="h-3 w-3" /> PRN {claim.prnNumber}
                        </span>
                        <span>{claim.date}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Claim Inspection & Decision (Properly Scrollable with Bottom Action Area) */}
          <div className="md:col-span-7 flex flex-col h-full overflow-hidden bg-neutral-50/30 dark:bg-neutral-900/40">
            {selectedClaim ? (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-400">Claim Record</span>
                    <h3 className="text-xl font-bold">{selectedClaim.id}</h3>
                  </div>
                  {selectedClaim.token && (
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">Token Code</span>
                      <p className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {selectedClaim.token}
                      </p>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-white/10">
                  {selectedClaim.image && (
                    <img 
                      src={selectedClaim.image} 
                      alt={selectedClaim.itemTitle} 
                      className="h-16 w-16 rounded-xl object-cover shrink-0" 
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-sm">{selectedClaim.itemTitle}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Category: {selectedClaim.category}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Linked Item Database ID: #{selectedClaim.itemId}
                    </p>
                  </div>
                </div>

                {/* Claimant Verification Details */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800/40">
                    <span className="text-neutral-400 font-mono uppercase block text-[10px] mb-1">Claimant Verification</span>
                    <p className="font-semibold text-sm">{selectedClaim.claimantName}</p>
                    <p className="font-mono text-neutral-500">Student PRN: {selectedClaim.prnNumber}</p>
                  </div>

                  <div className="p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800/40">
                    <span className="text-neutral-400 font-mono uppercase block text-[10px] mb-1">Proof of Ownership Statement</span>
                    <p className="text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
                      &quot;{selectedClaim.proofDetail}&quot;
                    </p>
                  </div>

                  {/* Uploaded Proof Document / Image if attached */}
                  {selectedClaim.proofImage && (
                    <div className="p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-neutral-400 font-mono uppercase block text-[10px]">
                          Uploaded Proof Document / Receipt
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Photo Attached
                        </span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 max-w-xs bg-neutral-100 dark:bg-neutral-900/60">
                        <img 
                          src={selectedClaim.proofImage} 
                          alt="Claim Proof Attachment" 
                          className="w-full h-36 object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                          onClick={() => window.open(selectedClaim.proofImage, "_blank")}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1.5">Click photo to view high resolution</p>
                    </div>
                  )}
                </div>

                {/* Streamlined 3-Stage Progress Pipeline */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-semibold">
                      Claim Progress
                    </span>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                      Counter Verification
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>1. Submitted</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 ${
                      selectedClaim.status === "Verified & Approved" || selectedClaim.status === "Handover Scheduled" || selectedClaim.status === "Returned" || selectedClaim.status === "Handover Completed"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-700 font-medium"
                    }`}>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>2. Approved</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 ${
                      selectedClaim.status === "Returned" || selectedClaim.status === "Handover Completed"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-700 font-medium"
                    }`}>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>3. Returned</span>
                    </div>
                  </div>
                </div>

                {/* Live Claim & Counter Pickup Status for Student */}
                <div className="pt-3 border-t border-neutral-200 dark:border-white/10 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Claim & Pickup Status:</p>
                  
                  {selectedClaim.status === "Returned" || selectedClaim.status === "Handover Completed" ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Item Returned & Handover Completed ✓</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-normal mt-0.5">Physical exchange verified and closed in the campus DBMS.</p>
                      </div>
                    </div>
                  ) : selectedClaim.status === "Verified & Approved" || selectedClaim.status === "Handover Scheduled" ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold space-y-2">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <span>Claim Approved by Admin ✓</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/70 dark:bg-neutral-800/80 border border-emerald-500/20 text-xs text-neutral-800 dark:text-neutral-200 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-neutral-950 dark:text-white">
                          <Building2 className="h-4 w-4 text-emerald-600" />
                          Collection Desk: Central Security Desk Counter 2
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          Please visit Counter 2 during campus hours (9:00 AM - 5:00 PM). Present your College PRN ({selectedClaim.prnNumber}) to collect your item.
                        </p>
                      </div>
                    </div>
                  ) : selectedClaim.status === "Rejected" ? (
                    <div className="p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-semibold flex items-center gap-3">
                      <XCircle className="h-6 w-6 text-rose-600 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Claim Rejected by Admin ✕</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-normal mt-0.5">The submitted proof did not match the item specifications in safekeeping.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-semibold space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
                        <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                        <span>Under Admin Verification</span>
                      </div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 font-normal">
                        Your claim has been submitted to the Admin. Once verified, pickup instructions for Counter 2 will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                Select a claim to inspect details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
