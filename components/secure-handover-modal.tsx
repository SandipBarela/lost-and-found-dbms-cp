"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Key, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  User, 
  Calendar,
  Users,
  Stamp,
  Clock,
  ArrowRight,
  Check,
  PackageCheck
} from "lucide-react";

export interface HandoverRecord {
  token: string;
  itemTitle: string;
  category: string;
  foundId?: number;
  claimantName: string;
  claimantPrn: string;
  finderName?: string;
  handoverDesk: string;
  status: "Pending Approval" | "Claim Approved" | "Handover Scheduled" | "Returned" | "Ready for Pickup" | "Handed Over & Closed";
  currentStep?: number;
  image?: string;
  proofDetail: string;
  adminReviewStatus?: string;
}

const SAMPLE_TOKENS: HandoverRecord[] = [
  {
    token: "RET-482910-0084",
    itemTitle: "Apple Watch SE (Silver)",
    category: "Electronics",
    foundId: 1,
    claimantName: "Sandip Barela",
    claimantPrn: "1032210084",
    finderName: "Aarav Sharma (Room 1001)",
    handoverDesk: "Central Security Desk Counter 2",
    status: "Claim Approved",
    currentStep: 2,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
    proofDetail: "Scratch near right corner of glass; serial number ending in 98X4.",
    adminReviewStatus: "Verified & Approved"
  },
  {
    token: "RET-912384-0156",
    itemTitle: "Honda Car Key with Dorm FOB",
    category: "Keys & Badges",
    foundId: 4,
    claimantName: "Rohan Kulkarni",
    claimantPrn: "1032210156",
    finderName: "Security Custody Officer",
    handoverDesk: "Central Security Desk Counter 2",
    status: "Returned",
    currentStep: 5,
    image: "https://images.unsplash.com/photo-1666346166849-8443c47f50fa?auto=format&fit=crop&w=600&q=80",
    proofDetail: "Red woven lanyard with dorm room key 204 attached.",
    adminReviewStatus: "Verified & Approved"
  }
];

interface SecureHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string;
  onHandoverComplete?: (token: string, record: HandoverRecord) => void;
}

export default function SecureHandoverModal({ isOpen, onClose, initialToken, onHandoverComplete }: SecureHandoverModalProps) {
  const [tokenInput, setTokenInput] = useState(initialToken || "RET-482910-0084");
  const [activeRecord, setActiveRecord] = useState<HandoverRecord | null>(SAMPLE_TOKENS[0]);
  const [currentStep, setCurrentStep] = useState<number>(2); // 1: Approve, 2: Schedule, 3: Meetup, 4: Confirm, 5: Returned
  const [checkIdVerified, setCheckIdVerified] = useState(false);
  const [checkItemInspected, setCheckItemInspected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [records, setRecords] = useState<HandoverRecord[]>(SAMPLE_TOKENS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initialToken if provided
  useEffect(() => {
    if (initialToken && isOpen) {
      setTokenInput(initialToken);
      handleLookup(initialToken);
    }
  }, [initialToken, isOpen]);

  // Load live handover tokens from MySQL item_hand_over table
  useEffect(() => {
    if (isOpen) {
      fetch("/api/handover")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.records && data.records.length > 0) {
            setRecords(data.records);
            if (!initialToken) {
              const first = data.records[0];
              setActiveRecord(first);
              setTokenInput(first.token);
              determineStep(first);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const determineStep = (record: HandoverRecord) => {
    if (record.status === "Returned" || record.status === "Handed Over & Closed") {
      setCurrentStep(5);
    } else if (record.status === "Handover Scheduled") {
      setCurrentStep(3);
    } else if (record.adminReviewStatus === "Verified & Approved" || record.status === "Claim Approved" || record.status === "Ready for Pickup") {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  };

  const handleLookup = async (tokenToLook: string) => {
    if (!tokenToLook.trim()) return;
    setErrorMessage(null);
    const cleanToken = tokenToLook.trim().toUpperCase();

    // 1. Try local records first
    const found = records.find(r => r.token.trim().toUpperCase() === cleanToken);
    if (found) {
      setActiveRecord(found);
      determineStep(found);
    }

    // 2. Query live database
    try {
      const res = await fetch(`/api/handover?token=${encodeURIComponent(cleanToken)}`);
      const data = await res.json();
      if (data.success && data.record) {
        setActiveRecord(data.record);
        determineStep(data.record);
        setRecords(prev => {
          const exists = prev.some(r => r.token.trim().toUpperCase() === cleanToken);
          return exists ? prev.map(r => r.token.trim().toUpperCase() === cleanToken ? data.record : r) : [data.record, ...prev];
        });
        return;
      }
    } catch (e) {}

    if (!found) {
      setActiveRecord(null);
      setErrorMessage(`No matching handover token found for "${tokenToLook}". Ensure PRN and token format is correct.`);
    }
  };

  // Step 1: Admin Approves the Claim
  const handleApproveClaim = () => {
    if (!activeRecord) return;
    const updated: HandoverRecord = {
      ...activeRecord,
      adminReviewStatus: "Verified & Approved",
      status: "Claim Approved",
      currentStep: 2
    };
    setActiveRecord(updated);
    setCurrentStep(2);
  };

  // Step 2: Schedule Handover
  const handleScheduleHandover = async () => {
    if (!activeRecord) return;
    setIsProcessing(true);
    const currentToken = activeRecord.token;

    try {
      await fetch("/api/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: currentToken, action: "schedule" })
      });
    } catch {}

    const updated: HandoverRecord = {
      ...activeRecord,
      status: "Handover Scheduled",
      currentStep: 3
    };
    setActiveRecord(updated);
    setCurrentStep(3);
    setIsProcessing(false);
  };

  // Step 4: Admin Clicks Confirm Handover -> Step 5: System Changes Item Status to Returned
  const handleConfirmHandover = async () => {
    if (!activeRecord) return;
    setIsProcessing(true);
    const currentToken = activeRecord.token;

    try {
      await fetch("/api/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: currentToken, action: "confirm" })
      });
    } catch {}

    const updatedRecord: HandoverRecord = {
      ...activeRecord,
      status: "Returned",
      currentStep: 5
    };

    setRecords(prev => prev.map(r => r.token === currentToken ? updatedRecord : r));
    setActiveRecord(updatedRecord);
    setCurrentStep(5);
    setIsProcessing(false);

    onHandoverComplete?.(currentToken, updatedRecord);
  };

  const steps = [
    { num: 1, title: "Admin Approves", desc: "Claim verified" },
    { num: 2, title: "Schedule Handover", desc: "Counter & time set" },
    { num: 3, title: "Physical Meetup", desc: "Student & finder meet" },
    { num: 4, title: "Confirm Handover", desc: "Admin confirms signoff" },
    { num: 5, title: "Item Returned", desc: "Status updated in DB" }
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 editorial-modal-backdrop animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto editorial-modal-container p-6 sm:p-8 text-[#1F2421]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="btn-tactile-secondary absolute top-6 right-6 p-2 text-xs"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge-campus inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Handover – Simple Workflow
            </span>
            <span className="text-xs text-[#5A625E] font-mono hidden sm:inline">5-Stage Exchange Protocol</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2421]">Handover & Return Terminal</h2>
          <p className="text-xs sm:text-sm text-[#5A625E] mt-1 font-sans">
            Follow the 5-step verified process: Admin approval → Schedule handover → Physical meeting → Confirm handover → Item status marked <strong>Returned</strong>.
          </p>
        </div>

        {/* 5-Step Visual Workflow Progress Bar */}
        <div className="mb-6 p-3.5 sm:p-4 rounded-xl bg-white border border-[#CFC5B4] shadow-tactile-card overflow-x-auto">
          <div className="flex items-center justify-between min-w-[580px] gap-2">
            {steps.map((st) => {
              const isPast = currentStep > st.num;
              const isCurrent = currentStep === st.num;
              return (
                <div key={st.num} className="flex-1 flex flex-col items-center text-center relative">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-mono font-bold text-xs mb-1.5 transition-all ${
                    isPast
                      ? "bg-[#2D5A4C] text-white shadow-sm"
                      : isCurrent
                      ? "bg-[#D95D39] text-white shadow-tactile-btn scale-105"
                      : "bg-[#F2ECE1] text-[#5A625E] border border-[#E3DCD0]"
                  }`}>
                    {isPast ? <Check className="h-4 w-4" /> : st.num}
                  </div>
                  <span className={`text-[11px] font-semibold block leading-tight ${
                    isCurrent ? "text-[#D95D39]" : isPast ? "text-[#2D5A4C]" : "text-[#5A625E]"
                  }`}>
                    {st.title}
                  </span>
                  <span className="text-[10px] text-[#5A625E] font-mono mt-0.5">
                    {st.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Token Search Bar */}
        <div className="p-4 rounded-xl bg-white border border-[#CFC5B4] shadow-tactile-card mb-6">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#1F2421] mb-2 font-semibold">
            Input or Scan Student Retrieval Pass Token
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Key className="absolute left-3.5 top-3 h-4 w-4 text-[#5A625E]" />
              <input
                type="text"
                placeholder="e.g. RET-482910-0084"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="editorial-input pl-10 pr-4 font-mono text-sm uppercase tracking-wider"
              />
            </div>
            <button
              onClick={() => handleLookup(tokenInput)}
              className="btn-tactile-primary text-xs py-2.5 px-5 flex items-center gap-1.5"
            >
              <Search className="h-4 w-4" />
              Lookup Token
            </button>
          </div>

          {/* Quick preset suggestions */}
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-[#5A625E]">
            <span>Quick test tokens:</span>
            {SAMPLE_TOKENS.map(t => (
              <button
                key={t.token}
                onClick={() => {
                  setTokenInput(t.token);
                  handleLookup(t.token);
                }}
                className="font-mono text-[#D95D39] hover:underline cursor-pointer"
              >
                {t.token}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl badge-alert text-xs flex items-center gap-2 mb-6 border">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Active Handover Workflow Execution Area */}
        {activeRecord && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Record Overview Card */}
            <div className="p-5 rounded-xl border border-[#CFC5B4] bg-white shadow-tactile-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3DCD0] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A625E]">Handover Pass Token</span>
                  <p className="font-serif text-xl font-mono font-extrabold text-[#D95D39]">{activeRecord.token}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    currentStep === 5 || activeRecord.status === "Returned"
                      ? "badge-verified"
                      : "badge-campus"
                  }`}>
                    {currentStep === 5 || activeRecord.status === "Returned" ? "Returned ✓" : activeRecord.status}
                  </span>
                </div>
              </div>

              {/* Item and Parties Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Item Details */}
                <div className="flex gap-3 p-3 rounded-lg bg-[#FAF7F2] border border-[#E3DCD0]">
                  {activeRecord.image && (
                    <img 
                      src={activeRecord.image} 
                      alt={activeRecord.itemTitle} 
                      className="h-16 w-16 rounded-lg object-cover shrink-0 border border-[#E3DCD0]" 
                    />
                  )}
                  <div>
                    <span className="text-[#5A625E] block text-[10px] uppercase font-mono">Item in Custody</span>
                    <h4 className="font-semibold text-sm text-[#1F2421]">{activeRecord.itemTitle}</h4>
                    <p className="text-[#5A625E] font-mono text-[11px]">{activeRecord.category}</p>
                    <p className="text-[10px] text-[#5A625E] mt-1">Proof: &quot;{activeRecord.proofDetail}&quot;</p>
                  </div>
                </div>

                {/* Parties Details: Student & Finder */}
                <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E3DCD0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5A625E] block text-[10px] uppercase font-mono">Exchange Parties</span>
                    <span className="badge-verified text-[10px] font-mono font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full">
                      <Users className="h-3 w-3" /> Counter 2
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#5A625E] block text-[10px]">Claimant (Student):</span>
                      <p className="font-bold text-[#1F2421] truncate">{activeRecord.claimantName}</p>
                      <p className="font-mono text-[#5A625E] text-[10px]">PRN: {activeRecord.claimantPrn}</p>
                    </div>
                    <div>
                      <span className="text-[#5A625E] block text-[10px]">Finder / Custodian:</span>
                      <p className="font-bold text-[#1F2421] truncate">{activeRecord.finderName || "Campus Custody Officer"}</p>
                      <p className="text-[#5A625E] text-[10px]">Central Security Desk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 1: ADMIN APPROVES CLAIM */}
            <div className={`p-5 rounded-xl border border-[#CFC5B4] bg-white shadow-tactile-card transition-all`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                    currentStep > 1 ? "bg-[#2D5A4C] text-white" : "bg-[#D95D39] text-white"
                  }`}>
                    {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1F2421]">Step 1: Admin Approves the Claim</h4>
                    <p className="text-xs text-[#5A625E]">Admin reviews ownership statement & student PRN verification.</p>
                  </div>
                </div>

                {currentStep > 1 ? (
                  <span className="badge-verified text-xs font-mono font-semibold flex items-center gap-1 px-3 py-1 rounded-full border">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Claim Approved
                  </span>
                ) : (
                  <button
                    onClick={handleApproveClaim}
                    className="btn-tactile-primary text-xs py-2 px-4"
                  >
                    Approve Claim
                  </button>
                )}
              </div>
            </div>

            {/* STEP 2: A SCHEDULE HANDOVER BUTTON APPEARS */}
            {currentStep >= 2 && (
              <div className="p-5 rounded-xl border border-[#CFC5B4] bg-white shadow-tactile-card transition-all animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      currentStep > 2 ? "bg-[#2D5A4C] text-white" : "bg-[#D95D39] text-white"
                    }`}>
                      {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1F2421]">Step 2: Schedule Handover</h4>
                      <p className="text-xs text-[#5A625E]">Schedule exchange desk and notification for student & finder.</p>
                    </div>
                  </div>

                  {currentStep > 2 ? (
                    <span className="badge-verified text-xs font-mono font-semibold flex items-center gap-1 px-3 py-1 rounded-full border">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Handover Scheduled
                    </span>
                  ) : (
                    <button
                      onClick={handleScheduleHandover}
                      disabled={isProcessing}
                      className="btn-tactile-primary text-xs py-2.5 px-5 flex items-center gap-1.5"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>{isProcessing ? "Scheduling..." : "Schedule Handover"}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: STUDENT & FINDER MEET PHYSICALLY TO EXCHANGE THE ITEM */}
            {currentStep >= 3 && (
              <div className="p-5 rounded-xl border border-[#CFC5B4] bg-white shadow-tactile-card transition-all animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5 mb-3">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs mt-0.5 ${
                    currentStep > 3 ? "bg-[#2D5A4C] text-white" : "bg-[#D95D39] text-white"
                  }`}>
                    {currentStep > 3 ? <Check className="h-4 w-4" /> : "3"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1F2421]">Step 3: Student & Finder Meet Physically to Exchange the Item</h4>
                    <p className="text-xs text-[#5A625E]">
                      Both parties meet in person at <strong>Central Security Desk Counter 2</strong> for physical inspection and item handover.
                    </p>
                  </div>
                </div>

                {currentStep < 5 && (
                  <div className="mt-3 p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E3DCD0] space-y-2 text-xs">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A625E] block font-semibold">
                      In-Person Verification Checklist:
                    </span>
                    <label className="flex items-center gap-2.5 text-[#1F2421] cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checkIdVerified} 
                        onChange={(e) => setCheckIdVerified(e.target.checked)}
                        className="rounded accent-[#D95D39] h-4 w-4 cursor-pointer" 
                      />
                      <span>Physical College ID verified for {activeRecord.claimantName} (PRN: {activeRecord.claimantPrn})</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-[#1F2421] cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checkItemInspected} 
                        onChange={(e) => setCheckItemInspected(e.target.checked)}
                        className="rounded accent-[#D95D39] h-4 w-4 cursor-pointer" 
                      />
                      <span>Student and finder met in person; item physical condition inspected and accepted</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: ADMIN CLICKS CONFIRM HANDOVER */}
            {currentStep >= 3 && currentStep < 5 && (
              <div className="p-5 rounded-xl border border-[#CFC5B4] bg-white shadow-tactile-card animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-[#D95D39] text-white flex items-center justify-center font-mono font-bold text-xs">
                      4
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1F2421]">Step 4: Admin Clicks Confirm Handover</h4>
                      <p className="text-xs text-[#5A625E]">Sign off on the exchange after student & finder physical meetup.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmHandover}
                    disabled={isProcessing || !checkIdVerified || !checkItemInspected}
                    className="btn-tactile-primary py-3 px-6 text-xs flex items-center justify-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Stamp className="h-4 w-4" />
                    <span>{isProcessing ? "Confirming Handover..." : "Confirm Handover"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: THE SYSTEM CHANGES THE ITEM STATUS TO RETURNED */}
            {currentStep === 5 && (
              <div className="p-6 rounded-xl border border-[#BFD9CE] bg-[#E1EFE9] text-[#225444] text-center space-y-3 shadow-tactile-card animate-in zoom-in-95 duration-200">
                <div className="h-14 w-14 mx-auto rounded-full bg-[#2D5A4C]/15 text-[#2D5A4C] flex items-center justify-center">
                  <PackageCheck className="h-8 w-8" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#2D5A4C] font-bold block">
                    Step 5 Complete
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#225444]">
                    Item Status Changed to: Returned
                  </h3>
                  <p className="text-xs sm:text-sm text-[#225444]/90 max-w-md mx-auto mt-1 font-sans">
                    The physical exchange between student <strong className="text-[#1F2421]">{activeRecord.claimantName}</strong> and finder is complete. All DBMS records and live item feeds now mark this item as <strong>Returned</strong>.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={onClose}
                    className="btn-tactile-primary text-xs py-2.5 px-6"
                  >
                    Done & Close Terminal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
