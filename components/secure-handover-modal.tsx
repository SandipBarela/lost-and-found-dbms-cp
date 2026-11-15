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
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xl p-6 sm:p-8 text-neutral-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Handover – Simple Workflow
            </span>
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">5-Stage Exchange Protocol</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Handover & Return Terminal</h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Follow the 5-step verified process: Admin approval $\rightarrow$ Schedule handover $\rightarrow$ Physical meeting $\rightarrow$ Confirm handover $\rightarrow$ Item status marked <strong>Returned</strong>.
          </p>
        </div>

        {/* 5-Step Visual Workflow Progress Bar */}
        <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-white/10 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[580px] gap-2">
            {steps.map((st) => {
              const isPast = currentStep > st.num;
              const isCurrent = currentStep === st.num;
              return (
                <div key={st.num} className="flex-1 flex flex-col items-center text-center relative">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-mono font-bold text-xs mb-1.5 transition-all ${
                    isPast
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : isCurrent
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-md shadow-indigo-600/30 scale-105"
                      : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                  }`}>
                    {isPast ? <Check className="h-4 w-4" /> : st.num}
                  </div>
                  <span className={`text-[11px] font-semibold block leading-tight ${
                    isCurrent ? "text-indigo-600 dark:text-indigo-400" : isPast ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-500"
                  }`}>
                    {st.title}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-light mt-0.5">
                    {st.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Token Search Bar */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-white/10 mb-6">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 font-semibold">
            Input or Scan Student Retrieval Pass Token
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Key className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="e.g. RET-482910-0084"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-neutral-900 font-mono text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <button
              onClick={() => handleLookup(tokenInput)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Search className="h-4 w-4" />
              Lookup Token
            </button>
          </div>

          {/* Quick preset suggestions */}
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-neutral-500">
            <span>Quick test tokens:</span>
            {SAMPLE_TOKENS.map(t => (
              <button
                key={t.token}
                onClick={() => {
                  setTokenInput(t.token);
                  handleLookup(t.token);
                }}
                className="font-mono text-indigo-500 hover:underline cursor-pointer"
              >
                {t.token}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2 mb-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Active Handover Workflow Execution Area */}
        {activeRecord && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Record Overview Card */}
            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Handover Pass Token</span>
                  <p className="text-xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400">{activeRecord.token}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    currentStep === 5 || activeRecord.status === "Returned"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : currentStep === 3
                      ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  }`}>
                    {currentStep === 5 || activeRecord.status === "Returned" ? "Returned ✓" : activeRecord.status}
                  </span>
                </div>
              </div>

              {/* Item and Parties Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Item Details */}
                <div className="flex gap-3 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10">
                  {activeRecord.image && (
                    <img 
                      src={activeRecord.image} 
                      alt={activeRecord.itemTitle} 
                      className="h-16 w-16 rounded-xl object-cover shrink-0" 
                    />
                  )}
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-mono">Item in Custody</span>
                    <h4 className="font-semibold text-sm text-neutral-900 dark:text-white">{activeRecord.itemTitle}</h4>
                    <p className="text-neutral-500 font-mono text-[11px]">{activeRecord.category}</p>
                    <p className="text-[10px] text-neutral-400 mt-1">Proof: &quot;{activeRecord.proofDetail}&quot;</p>
                  </div>
                </div>

                {/* Parties Details: Student & Finder */}
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 block text-[10px] uppercase font-mono">Exchange Parties</span>
                    <span className="text-[10px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                      <Users className="h-3 w-3" /> Counter 2
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Claimant (Student):</span>
                      <p className="font-bold text-neutral-900 dark:text-white truncate">{activeRecord.claimantName}</p>
                      <p className="font-mono text-neutral-500 text-[10px]">PRN: {activeRecord.claimantPrn}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Finder / Custodian:</span>
                      <p className="font-bold text-neutral-900 dark:text-white truncate">{activeRecord.finderName || "Campus Custody Officer"}</p>
                      <p className="text-neutral-500 text-[10px]">Central Security Desk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 1: ADMIN APPROVES CLAIM */}
            <div className={`p-5 rounded-2xl border transition-all ${
              currentStep === 1 
                ? "border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/20" 
                : "border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                    currentStep > 1 ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"
                  }`}>
                    {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Step 1: Admin Approves the Claim</h4>
                    <p className="text-xs text-neutral-500">Admin reviews ownership statement & student PRN verification.</p>
                  </div>
                </div>

                {currentStep > 1 ? (
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Claim Approved
                  </span>
                ) : (
                  <button
                    onClick={handleApproveClaim}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    Approve Claim
                  </button>
                )}
              </div>
            </div>

            {/* STEP 2: A SCHEDULE HANDOVER BUTTON APPEARS */}
            {currentStep >= 2 && (
              <div className={`p-5 rounded-2xl border transition-all animate-in fade-in duration-200 ${
                currentStep === 2 
                  ? "border-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/20" 
                  : "border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      currentStep > 2 ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"
                    }`}>
                      {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Step 2: Schedule Handover</h4>
                      <p className="text-xs text-neutral-500">Schedule exchange desk and notification for student & finder.</p>
                    </div>
                  </div>

                  {currentStep > 2 ? (
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Handover Scheduled
                    </span>
                  ) : (
                    <button
                      onClick={handleScheduleHandover}
                      disabled={isProcessing}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer flex items-center gap-1.5"
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
              <div className={`p-5 rounded-2xl border transition-all animate-in fade-in duration-200 ${
                currentStep === 3 
                  ? "border-sky-500/40 bg-sky-50/30 dark:bg-sky-950/20" 
                  : "border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900"
              }`}>
                <div className="flex items-start gap-2.5 mb-3">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs mt-0.5 ${
                    currentStep > 3 ? "bg-emerald-500 text-white" : "bg-sky-600 text-white"
                  }`}>
                    {currentStep > 3 ? <Check className="h-4 w-4" /> : "3"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Step 3: Student & Finder Meet Physically to Exchange the Item</h4>
                    <p className="text-xs text-neutral-500">
                      Both parties meet in person at <strong>Central Security Desk Counter 2</strong> for physical inspection and item handover.
                    </p>
                  </div>
                </div>

                {currentStep < 5 && (
                  <div className="mt-3 p-3.5 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-white/10 space-y-2 text-xs">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
                      In-Person Verification Checklist:
                    </span>
                    <label className="flex items-center gap-2.5 text-neutral-800 dark:text-neutral-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checkIdVerified} 
                        onChange={(e) => setCheckIdVerified(e.target.checked)}
                        className="rounded accent-emerald-600 h-4 w-4 cursor-pointer" 
                      />
                      <span>Physical College ID verified for {activeRecord.claimantName} (PRN: {activeRecord.claimantPrn})</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-neutral-800 dark:text-neutral-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checkItemInspected} 
                        onChange={(e) => setCheckItemInspected(e.target.checked)}
                        className="rounded accent-emerald-600 h-4 w-4 cursor-pointer" 
                      />
                      <span>Student and finder met in person; item physical condition inspected and accepted</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: ADMIN CLICKS CONFIRM HANDOVER */}
            {currentStep >= 3 && currentStep < 5 && (
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-xs">
                      4
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Step 4: Admin Clicks Confirm Handover</h4>
                      <p className="text-xs text-neutral-500">Sign off on the exchange after student & finder physical meetup.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmHandover}
                    disabled={isProcessing || !checkIdVerified || !checkItemInspected}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    <Stamp className="h-4 w-4" />
                    <span>{isProcessing ? "Confirming Handover..." : "Confirm Handover"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: THE SYSTEM CHANGES THE ITEM STATUS TO RETURNED */}
            {currentStep === 5 && (
              <div className="p-6 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="h-14 w-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <PackageCheck className="h-8 w-8" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                    Step 5 Complete
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                    Item Status Changed to: Returned
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto mt-1">
                    The physical exchange between student <strong className="text-neutral-900 dark:text-white">{activeRecord.claimantName}</strong> and finder is complete. All DBMS records and live item feeds now mark this item as <strong>Returned</strong>.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
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
