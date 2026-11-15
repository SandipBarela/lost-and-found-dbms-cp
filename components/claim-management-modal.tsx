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
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 editorial-modal-backdrop animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl h-[90vh] max-h-[850px] overflow-hidden editorial-modal-container flex flex-col text-[#1F2421]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Clear Close Button */}
        <div className="p-5 sm:p-6 border-b border-[#E3DCD0] flex items-center justify-between shrink-0 bg-[#FAF7F2]">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-campus inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Claim Tracking
              </span>
              <span className="text-xs text-[#5A625E] font-mono hidden sm:inline">Live Student Status</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2421] mt-1">My Claims & Pickup Status</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Claim Console"
            className="btn-tactile-secondary text-xs flex items-center gap-1.5"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Action notification banner with UNDO Action */}
        {actionNotice && (
          <div className="px-6 py-2.5 bg-[#E1EFE9] border-b border-[#BFD9CE] text-[#225444] text-xs font-medium flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#225444]" />
              <span>{actionNotice.message}</span>
            </div>
            {actionNotice.undo && (
              <button
                onClick={() => {
                  actionNotice.undo?.();
                  setActionNotice(null);
                }}
                className="btn-tactile-primary text-xs py-1 px-2.5"
              >
                <span>Undo</span>
              </button>
            )}
          </div>
        )}

        {/* Main Body - Fixed 2-Column Responsive Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: Claims List */}
          <div className="md:col-span-5 p-4 sm:p-5 border-r border-[#E3DCD0] flex flex-col h-full overflow-hidden bg-[#FAF7F2]">
            {/* Filter and Search Bar */}
            <div className="space-y-2.5 mb-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#5A625E]" />
                <input
                  type="text"
                  placeholder="Search PRN, name, claim ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="editorial-input text-xs pl-9 py-1.5"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {[
                  { key: "All", label: "All" },
                  { key: "Approved", label: "Approved" },
                  { key: "Pending", label: "Pending" },
                  { key: "Rejected", label: "Rejected" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
                      statusFilter === key
                        ? "btn-tactile-primary py-1 px-3"
                        : "bg-white border border-[#CFC5B4] text-[#5A625E] hover:text-[#1F2421]"
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
                <div className="py-12 text-center text-xs text-[#5A625E] font-mono">
                  No claims match the filter criteria.
                </div>
              ) : (
                filteredClaims.map((claim) => {
                  const isSelected = selectedClaim?.id === claim.id;
                  return (
                    <div
                      key={claim.id}
                      onClick={() => setSelectedClaim(claim)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer shadow-tactile-card ${
                        isSelected
                          ? "border-[1.5px] border-[#D95D39] bg-white ring-1 ring-[#D95D39]"
                          : "border-[#E3DCD0] hover:border-[#CFC5B4] bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[11px] font-mono font-bold text-[#1F2421]">
                          {claim.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${
                          claim.status === "Returned" || claim.status === "Handover Completed"
                            ? "badge-verified"
                            : claim.status === "Handover Scheduled" || claim.status === "Verified & Approved"
                            ? "badge-verified"
                            : claim.status === "Pending Review"
                            ? "badge-campus"
                            : "badge-alert"
                        }`}>
                          {claim.status === "Handover Completed" ? "Returned ✓" : claim.status}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold truncate text-[#1F2421]">{claim.itemTitle}</h4>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#5A625E]">
                        <span className="flex items-center gap-1 font-mono">
                          <User className="h-3 w-3 text-[#2D5A4C]" /> PRN {claim.prnNumber}
                        </span>
                        <span className="font-mono">{claim.date}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Claim Inspection & Decision (Properly Scrollable with Bottom Action Area) */}
          <div className="md:col-span-7 flex flex-col h-full overflow-hidden bg-[#F2ECE1]/40">
            {selectedClaim ? (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E3DCD0] pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#5A625E]">Claim Record</span>
                    <h3 className="font-serif text-xl font-bold text-[#1F2421]">{selectedClaim.id}</h3>
                  </div>
                  {selectedClaim.token && (
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-[#5A625E]">Token Code</span>
                      <p className="font-mono text-sm font-bold text-[#D95D39]">
                        {selectedClaim.token}
                      </p>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-[#CFC5B4] shadow-tactile-card">
                  {selectedClaim.image && (
                    <img 
                      src={selectedClaim.image} 
                      alt={selectedClaim.itemTitle} 
                      className="h-16 w-16 rounded-lg object-cover shrink-0 border border-[#E3DCD0]" 
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-sm text-[#1F2421]">{selectedClaim.itemTitle}</h4>
                    <p className="text-xs text-[#5A625E]">
                      Category: {selectedClaim.category}
                    </p>
                    <p className="text-xs text-[#5A625E] font-mono">
                      Linked Item Database ID: #{selectedClaim.itemId}
                    </p>
                  </div>
                </div>

                {/* Claimant Verification Details */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl border border-[#CFC5B4] bg-white shadow-tactile-card">
                    <span className="text-[#5A625E] font-mono uppercase block text-[10px] mb-1">Claimant Verification</span>
                    <p className="font-semibold text-sm text-[#1F2421]">{selectedClaim.claimantName}</p>
                    <p className="font-mono text-[#5A625E]">Student PRN: {selectedClaim.prnNumber}</p>
                  </div>

                  <div className="p-3 rounded-xl border border-[#CFC5B4] bg-white shadow-tactile-card">
                    <span className="text-[#5A625E] font-mono uppercase block text-[10px] mb-1">Proof of Ownership Statement</span>
                    <p className="text-[#1F2421] italic leading-relaxed">
                      &quot;{selectedClaim.proofDetail}&quot;
                    </p>
                  </div>

                  {/* Uploaded Proof Document / Image if attached */}
                  {selectedClaim.proofImage && (
                    <div className="p-3 rounded-xl border border-[#CFC5B4] bg-white shadow-tactile-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#5A625E] font-mono uppercase block text-[10px]">
                          Uploaded Proof Document / Receipt
                        </span>
                        <span className="badge-verified text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Photo Attached
                        </span>
                      </div>
                      <div className="rounded-lg overflow-hidden border border-[#E3DCD0] max-w-xs bg-[#FAF7F2]">
                        <img 
                          src={selectedClaim.proofImage} 
                          alt="Claim Proof Attachment" 
                          className="w-full h-36 object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                          onClick={() => window.open(selectedClaim.proofImage, "_blank")}
                        />
                      </div>
                      <p className="text-[10px] text-[#5A625E] font-mono mt-1.5">Click photo to view high resolution</p>
                    </div>
                  )}
                </div>

                {/* Streamlined 3-Stage Progress Pipeline */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase text-[#5A625E] font-semibold">
                      Claim Progress
                    </span>
                    <span className="text-[10px] font-mono text-[#D95D39] font-semibold">
                      Counter Verification
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                    <div className="badge-verified p-2.5 rounded-xl border flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>1. Submitted</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 ${
                      selectedClaim.status === "Verified & Approved" || selectedClaim.status === "Handover Scheduled" || selectedClaim.status === "Returned" || selectedClaim.status === "Handover Completed"
                        ? "badge-verified font-bold"
                        : "bg-white text-[#5A625E] border-[#CFC5B4] font-medium"
                    }`}>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>2. Approved</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 ${
                      selectedClaim.status === "Returned" || selectedClaim.status === "Handover Completed"
                        ? "badge-verified font-bold"
                        : "bg-white text-[#5A625E] border-[#CFC5B4] font-medium"
                    }`}>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>3. Returned</span>
                    </div>
                  </div>
                </div>

                {/* Live Claim & Counter Pickup Status for Student */}
                <div className="pt-3 border-t border-[#E3DCD0] space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#1F2421] font-mono">Claim & Pickup Status:</p>
                  
                  {selectedClaim.status === "Returned" || selectedClaim.status === "Handover Completed" ? (
                    <div className="p-4 rounded-xl bg-[#E1EFE9] border border-[#BFD9CE] text-[#225444] text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-tactile-card">
                      <CheckCircle2 className="h-6 w-6 text-[#2D5A4C] shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Item Returned & Handover Completed ✓</p>
                        <p className="text-xs text-[#5A625E] font-normal mt-0.5">Physical exchange verified and closed in the campus DBMS.</p>
                      </div>
                    </div>
                  ) : selectedClaim.status === "Verified & Approved" || selectedClaim.status === "Handover Scheduled" ? (
                    <div className="p-4 rounded-xl bg-[#E1EFE9] border border-[#BFD9CE] text-[#225444] text-xs sm:text-sm font-semibold space-y-2 shadow-tactile-card">
                      <div className="flex items-center gap-2 text-[#2D5A4C] font-bold text-sm">
                        <CheckCircle2 className="h-5 w-5 text-[#2D5A4C] shrink-0" />
                        <span>Claim Approved by Admin ✓</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-[#BFD9CE] text-xs text-[#1F2421] space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-[#1F2421]">
                          <Building2 className="h-4 w-4 text-[#D95D39]" />
                          Collection Desk: Central Security Desk Counter 2
                        </p>
                        <p className="text-[#5A625E]">
                          Please visit Counter 2 during campus hours (9:00 AM - 5:00 PM). Present your College PRN ({selectedClaim.prnNumber}) to collect your item.
                        </p>
                      </div>
                    </div>
                  ) : selectedClaim.status === "Rejected" ? (
                    <div className="p-4 rounded-xl bg-[#FAE6E0] border border-[#ECC3B6] text-[#A83C1D] text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-tactile-card">
                      <XCircle className="h-6 w-6 text-[#A83C1D] shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Claim Rejected by Admin ✕</p>
                        <p className="text-xs text-[#5A625E] font-normal mt-0.5">The submitted proof did not match the item specifications in safekeeping.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#EFE6D8] border border-[#DFD1BC] text-[#7C4A2D] text-xs sm:text-sm font-semibold space-y-1.5 shadow-tactile-card">
                      <div className="flex items-center gap-2 text-[#7C4A2D] font-bold text-sm">
                        <Clock className="h-5 w-5 text-[#7C4A2D] shrink-0" />
                        <span>Under Admin Verification</span>
                      </div>
                      <p className="text-xs text-[#5A625E] font-normal">
                        Your claim has been submitted to the Admin. Once verified, pickup instructions for Counter 2 will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#5A625E] font-mono">
                Select a claim to inspect details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
