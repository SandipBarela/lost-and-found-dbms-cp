"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Search, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Undo2, 
  LogIn, 
  X,
  Calendar,
  Filter,
  Check,
  Star,
  MessageSquare
} from "lucide-react";

interface AdminItem {
  id: number;
  type: "lost" | "found";
  title: string;
  category: string;
  location: string;
  date: string;
  prnNumber: string;
  status: string;
  image: string;
}

const INITIAL_ADMIN_ITEMS: AdminItem[] = [
  {
    id: 1,
    type: "lost",
    title: "Apple Watch SE (Silver)",
    category: "Electronics",
    location: "Library 2nd Floor",
    date: "Today, 2:30 PM",
    prnNumber: "1032210084",
    status: "Searching",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    type: "found",
    title: "Black Leather Bifold Wallet",
    category: "ID Cards & Wallets",
    location: "Student Center Cafeteria",
    date: "Yesterday",
    prnNumber: "1032210412",
    status: "In Safekeeping",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    type: "lost",
    title: "Dell XPS 15 Charger & Dongle",
    category: "Laptops & Accessories",
    location: "Engineering Hall B-104",
    date: "Oct 30",
    prnNumber: "1032210992",
    status: "Active Search",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    type: "found",
    title: "Honda Car Key with Dorm FOB",
    category: "Keys & Badges",
    location: "North Parking Lot",
    date: "Oct 29",
    prnNumber: "1032210156",
    status: "Awaiting Claim",
    image: "https://images.unsplash.com/photo-1666346166849-8443c47f50fa?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    type: "found",
    title: "HP Wireless Presenter Remote",
    category: "Electronics",
    location: "Main Auditorium Seminar Hall",
    date: "Oct 28",
    prnNumber: "1032210411",
    status: "In Safekeeping",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"
  }
];

interface AdminClaim {
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
}

const INITIAL_ADMIN_CLAIMS: AdminClaim[] = [
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
    token: "RET-482910-0084"
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
    status: "Pending Review"
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
    status: "Returned",
    token: "RET-912384-0156"
  }
];

export default function AdminPage() {
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"items" | "claims" | "feedback">("claims");
  const [items, setItems] = useState<AdminItem[]>(INITIAL_ADMIN_ITEMS);
  const [claims, setClaims] = useState<AdminClaim[]>(INITIAL_ADMIN_CLAIMS);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [claimStatusFilter, setClaimStatusFilter] = useState<string>("All");
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState<string>("All");
  const [toastMessage, setToastMessage] = useState<{ text: string; undo?: () => void } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lf_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role === "admin") {
          setIsAdminAuthorized(true);

          // Fetch live database items & metrics
          fetch("/api/admin/stats")
            .then(res => res.json())
            .then(data => {
              if (data.success && data.items && data.items.length > 0) {
                setItems(data.items);
              }
            })
            .catch(() => {});

          // Fetch live claims
          fetch("/api/claims")
            .then(res => res.json())
            .then(data => {
              if (data.success && data.claims && data.claims.length > 0) {
                setClaims(data.claims);
              }
            })
            .catch(() => {});

          // Fetch live student feedback
          fetch("/api/feedback")
            .then(res => res.json())
            .then(data => {
              if (data.success && data.feedback && data.feedback.length > 0) {
                setFeedbackList(data.feedback);
              }
            })
            .catch(() => {});
          return;
        }
      }
      setIsAdminAuthorized(false);
    } catch {
      setIsAdminAuthorized(false);
    }
  }, []);

  const showToast = (text: string, undo?: () => void) => {
    setToastMessage({ text, undo });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleDeleteItem = (id: number) => {
    const deletedItem = items.find(i => i.id === id);
    if (!deletedItem) return;

    setItems(prev => prev.filter(i => i.id !== id));

    // Delete in MySQL database
    fetch(`/api/admin/stats?id=${id}&type=${deletedItem.type}`, {
      method: "DELETE"
    }).catch(() => {});

    showToast(
      `Item #${id} ("${deletedItem.title}") removed from DBMS.`,
      () => {
        setItems(prev => [deletedItem, ...prev]);
        showToast(`Action reversed: Item #${id} restored to inventory.`);
      }
    );
  };

  const handleUpdateClaimStatus = (id: string, newStatus: AdminClaim["status"]) => {
    const previousClaim = claims.find(c => c.id === id);
    if (!previousClaim) return;

    const token = previousClaim.token || `RET-${Math.floor(100000 + Math.random() * 900000)}-${previousClaim.prnNumber.slice(-4)}`;

    setClaims(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: newStatus,
          token: (newStatus === "Verified & Approved" || newStatus === "Handover Scheduled" || newStatus === "Returned" || newStatus === "Handover Completed") ? token : c.token
        };
      }
      return c;
    }));

    // Update in MySQL review and claim tables
    fetch("/api/claims", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId: id, status: newStatus })
    }).catch(() => {});

    showToast(
      `Claim ${id} status updated to: ${newStatus}.`,
      () => {
        setClaims(prev => prev.map(c => c.id === id ? previousClaim : c));
        showToast(`Action reversed: Claim ${id} reverted to ${previousClaim.status}.`);
      }
    );
  };

  const filteredItems = items.filter(item => {
    const matchesType = typeFilter === "All" || 
      (typeFilter === "Lost" && item.type === "lost") ||
      (typeFilter === "Found" && item.type === "found");
    const matchesSearch = searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prnNumber.includes(searchQuery);
    return matchesType && matchesSearch;
  });

  const filteredClaims = claims.filter(c => {
    let matchesFilter = true;
    if (claimStatusFilter === "Approved") {
      matchesFilter = c.status === "Verified & Approved" || c.status === "Handover Scheduled" || c.status === "Returned" || c.status === "Handover Completed";
    } else if (claimStatusFilter === "Rejected") {
      matchesFilter = c.status === "Rejected";
    } else if (claimStatusFilter === "Pending") {
      matchesFilter = c.status === "Pending Review";
    }

    const matchesSearch = searchQuery === "" ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.prnNumber.includes(searchQuery) ||
      c.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.token && c.token.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.proofDetail.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const filteredFeedback = feedbackList.filter(f => {
    let matchesRating = true;
    if (feedbackRatingFilter !== "All") {
      matchesRating = Number(f.rating) === Number(feedbackRatingFilter);
    }

    const matchesSearch = searchQuery === "" ||
      (f.student_name && f.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.prn_number && f.prn_number.includes(searchQuery)) ||
      (f.comments && f.comments.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.item_title && f.item_title.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRating && matchesSearch;
  });

  // Authentication Gate: Non-admin users cannot access this page!
  if (isAdminAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-neutral-950 text-neutral-900 dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-purple-600 text-white font-mono font-bold flex items-center justify-center animate-pulse text-sm">
            AD
          </div>
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Checking Administrator clearance...</p>
        </div>
      </div>
    );
  }

  if (isAdminAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-neutral-950 text-neutral-900 dark:text-white p-4">
        <div className="max-w-md w-full p-8 rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Access Denied: Admin Only</h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2 leading-relaxed">
              This portal is strictly restricted to institutional DBMS Administrators. Please log in with administrator credentials.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Log In with Admin Credentials</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-neutral-900 dark:text-white font-sans transition-colors duration-300">
      {/* Toast Notification with Undo Action */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xl border border-neutral-700/40 text-sm font-semibold animate-in slide-in-from-bottom-5">
          <span>{toastMessage.text}</span>
          {toastMessage.undo && (
            <button
              onClick={() => {
                toastMessage.undo?.();
                setToastMessage(null);
              }}
              className="ml-2 flex items-center gap-1 px-3 py-1 rounded-lg bg-white/20 dark:bg-neutral-900/20 hover:bg-white/30 text-amber-300 dark:text-amber-600 font-bold text-xs cursor-pointer"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span>Undo</span>
            </button>
          )}
        </div>
      )}

      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                localStorage.removeItem("lf_user");
                sessionStorage.removeItem("lf_session_active");
                window.location.href = "/login";
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-white/10 text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 hover:border-transparent transition-colors cursor-pointer"
            >
              <LogIn className="h-4 w-4 rotate-180" />
              <span>Log Out</span>
            </button>
            <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700" />
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg overflow-hidden bg-white shadow-xs p-0.5 border border-neutral-300 dark:border-white/10 shrink-0">
                <img src="/reunite-logo.jpg" alt="ReUnite" className="h-full w-full object-contain" />
              </div>
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-neutral-950 dark:text-white flex items-center gap-2">
                <span>
                  <span className="text-[#0f294a] dark:text-[#93c5fd]">Re</span>
                  <span className="text-[#ea580c] dark:text-[#fb923c]">Unite</span> Admin Console
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm font-mono">
            <span className="hidden sm:inline font-bold text-neutral-700 dark:text-neutral-300">Campus DBMS Connected</span>
            <span className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
              ● Live System Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Metric KPI Overview - High Contrast & Crisp Fonts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl border-2 border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/80 shadow-sm">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Total Tracked Items
            </span>
            <p className="text-3xl sm:text-4xl font-black mt-1 text-neutral-950 dark:text-white">{items.length}</p>
            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold mt-1.5 block">Campus inventory</span>
          </div>

          <div className="p-5 rounded-3xl border-2 border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Pending Claims
              </span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-3xl sm:text-4xl font-black mt-1 text-amber-600 dark:text-amber-400">
              {claims.filter(c => c.status === "Pending Review").length}
            </p>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1.5 block">Requires approval</span>
          </div>

          <div className="p-5 rounded-3xl border-2 border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/80 shadow-sm">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Approved for Handover
            </span>
            <p className="text-3xl sm:text-4xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
              {claims.filter(c => c.status === "Verified & Approved" || c.status === "Handover Scheduled").length}
            </p>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 block">Ready for student pickup</span>
          </div>

          <div className="p-5 rounded-3xl border-2 border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/80 shadow-sm">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Returned Items
            </span>
            <p className="text-3xl sm:text-4xl font-black mt-1 text-indigo-600 dark:text-indigo-400">
              {claims.filter(c => c.status === "Returned" || c.status === "Handover Completed").length}
            </p>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1.5 block">Completed handovers</span>
          </div>
        </div>

        {/* Clean 2-Tab Selector */}
        <div className="flex items-center gap-3 border-b-2 border-neutral-200 dark:border-white/10 pb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("claims")}
            className={`px-6 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all cursor-pointer flex items-center gap-2.5 whitespace-nowrap ${
              activeTab === "claims"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-102"
                : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
            <span>1. Claims & Handover Desk ({claims.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("items")}
            className={`px-6 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all cursor-pointer flex items-center gap-2.5 whitespace-nowrap ${
              activeTab === "items"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-102"
                : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <Database className="h-5 w-5" />
            <span>2. Inventory Search & Clean-up ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-6 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all cursor-pointer flex items-center gap-2.5 whitespace-nowrap ${
              activeTab === "feedback"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-102"
                : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span>3. Student Feedback ({feedbackList.length})</span>
          </button>
        </div>

        {/* NOTICEABLE & PROMINENT SEARCH & FILTER BAR */}
        <div className="p-4 sm:p-5 rounded-3xl border-2 border-purple-500/30 dark:border-purple-500/20 bg-white dark:bg-neutral-900 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-purple-600 dark:text-purple-400" />
            <input
              type="text"
              placeholder={
                activeTab === "items" 
                  ? "Search inventory by title, category, location, or student PRN..." 
                  : activeTab === "claims"
                  ? "Search claims by ID (e.g. CLM-2026-054), student name, PRN, or item..."
                  : "Search feedback by student name, PRN, comments, or category..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-2xl border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm sm:text-base font-semibold text-neutral-950 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 p-1 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          {activeTab === "feedback" ? (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 hidden sm:inline">Rating:</span>
              {["All", "5", "4", "3"].map((r) => (
                <button
                  key={r}
                  onClick={() => setFeedbackRatingFilter(r)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border ${
                    feedbackRatingFilter === r
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/30 border-transparent scale-105"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {r === "All" ? "All Ratings" : `${r} ★`}
                </button>
              ))}
            </div>
          ) : activeTab === "items" ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 hidden sm:inline">Type:</span>
              {["All", "Lost", "Found"].map((f) => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    typeFilter === f
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 hidden sm:inline">Status:</span>
              {[
                { key: "All", label: "All", activeClass: "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-md" },
                { key: "Approved", label: "Approved", activeClass: "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border-emerald-600" },
                { key: "Pending", label: "Pending", activeClass: "bg-amber-600 text-white shadow-md shadow-amber-600/30 border-amber-600" },
                { key: "Rejected", label: "Rejected", activeClass: "bg-rose-600 text-white shadow-md shadow-rose-600/30 border-rose-600" },
              ].map(({ key, label, activeClass }) => (
                <button
                  key={key}
                  onClick={() => setClaimStatusFilter(key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border ${
                    claimStatusFilter === key
                      ? `${activeClass} scale-105 border-transparent`
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: CLAIMS APPROVAL CENTER (Primary Operational Hub) */}
        {activeTab === "claims" && (
          <div className="space-y-4">
            <div className="rounded-3xl border-2 border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100 dark:bg-neutral-800 border-b-2 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-bold uppercase text-xs sm:text-sm tracking-wider">
                    <tr>
                      <th className="py-4 px-5">Claim ID</th>
                      <th className="py-4 px-5">Claimant Name</th>
                      <th className="py-4 px-5">Target Item</th>
                      <th className="py-4 px-5">Ownership Proof Statement</th>
                      <th className="py-4 px-5">Status & Token</th>
                      <th className="py-4 px-5 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-white/10">
                    {filteredClaims.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-sm font-semibold text-neutral-500">
                          No claims match your search query &quot;{searchQuery}&quot;.
                        </td>
                      </tr>
                    ) : (
                      filteredClaims.map((claim, idx) => (
                        <tr key={`claim-${claim.id}-${idx}`} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                          <td className="py-4 px-5 font-mono font-extrabold text-sm sm:text-base text-neutral-950 dark:text-white">
                            {claim.id}
                          </td>
                          <td className="py-4 px-5">
                            <p className="font-bold text-sm sm:text-base text-neutral-950 dark:text-white">{claim.claimantName}</p>
                            <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">PRN: {claim.prnNumber}</span>
                          </td>
                          <td className="py-4 px-5">
                            <p className="font-bold text-sm sm:text-base text-neutral-950 dark:text-white">{claim.itemTitle}</p>
                            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                              Linked ID: #{claim.itemId} • {claim.category}
                            </span>
                          </td>
                          <td className="py-4 px-5 max-w-xs text-neutral-800 dark:text-neutral-200">
                            <p className="text-xs sm:text-sm line-clamp-2 leading-snug">
                              &quot;{claim.proofDetail}&quot;
                            </p>
                          </td>
                          <td className="py-4 px-5">
                            {claim.status === "Verified & Approved" || claim.status === "Handover Scheduled" || claim.status === "Returned" || claim.status === "Handover Completed" ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-600 text-white shadow-xs">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {claim.status === "Handover Completed" || claim.status === "Returned" ? "Returned ✓" : claim.status === "Handover Scheduled" ? "Handover Scheduled" : "Approved ✓"}
                              </span>
                            ) : claim.status === "Rejected" ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-600 text-white shadow-xs">
                                <XCircle className="h-3.5 w-3.5" />
                                Rejected ✕
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                                Pending Review
                              </span>
                            )}
                            {claim.token && (
                              <span className="block font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-1">
                                Pass: {claim.token}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                            {claim.status === "Pending Review" && (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateClaimStatus(claim.id, "Verified & Approved")}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/25 cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateClaimStatus(claim.id, "Rejected")}
                                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-rose-600/25 cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            )}
                            {(claim.status === "Verified & Approved" || claim.status === "Handover Scheduled") && (
                              <div className="inline-flex items-center gap-2">
                                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 shadow-xs">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Approved</span>
                                </span>
                                <button
                                  onClick={() => handleUpdateClaimStatus(claim.id, "Returned")}
                                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-purple-600/25 cursor-pointer inline-flex items-center gap-1.5"
                                  title="Student arrived with PRN - sign off and return item"
                                >
                                  <ShieldCheck className="h-4 w-4" />
                                  <span>Confirm Handover → Returned</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateClaimStatus(claim.id, "Rejected")}
                                  className="px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                                  title="Revoke and reject claim"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {claim.status === "Rejected" && (
                              <div className="inline-flex items-center gap-2">
                                <span className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 shadow-xs">
                                  <XCircle className="h-4 w-4" />
                                  <span>Rejected</span>
                                </span>
                                <button
                                  onClick={() => handleUpdateClaimStatus(claim.id, "Verified & Approved")}
                                  className="px-3 py-1.5 rounded-xl border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                                >
                                  Approve instead
                                </button>
                              </div>
                            )}
                            {(claim.status === "Returned" || claim.status === "Handover Completed") && (
                              <span className="text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-end gap-1.5">
                                <CheckCircle2 className="h-4 w-4" />
                                Returned
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY MASTER */}
        {activeTab === "items" && (
          <div className="space-y-4">
            <div className="rounded-3xl border-2 border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100 dark:bg-neutral-800 border-b-2 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-bold uppercase text-xs sm:text-sm tracking-wider">
                    <tr>
                      <th className="py-4 px-5">Item ID & Image</th>
                      <th className="py-4 px-5">Title & Category</th>
                      <th className="py-4 px-5">Location</th>
                      <th className="py-4 px-5">PRN / User ID</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Clean-up Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-white/10">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-sm font-semibold text-neutral-500">
                          No inventory items match your search query &quot;{searchQuery}&quot;.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map(item => (
                        <tr key={`${item.type}-${item.id}`} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.title} className="h-12 w-12 rounded-xl object-cover border border-neutral-200 dark:border-white/10" />
                              <div>
                                <span className="font-mono font-extrabold text-sm sm:text-base text-neutral-950 dark:text-white">#{item.id}</span>
                                <span className={`block text-xs font-mono font-bold uppercase ${item.type === "lost" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                  {item.type}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <p className="font-bold text-sm sm:text-base text-neutral-950 dark:text-white">{item.title}</p>
                            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{item.category}</span>
                          </td>
                          <td className="py-4 px-5 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            {item.location}
                          </td>
                          <td className="py-4 px-5 font-mono font-bold text-xs sm:text-sm text-neutral-800 dark:text-neutral-200">
                            {item.prnNumber}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`font-mono text-xs font-bold px-3 py-1 rounded-full ${
                              item.status === "Returned" 
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" 
                                : "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                            }`}>
                              {item.status === "Returned" ? "Returned ✓" : item.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              title="Delete fake, duplicate, or expired report from DBMS"
                              className="px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white text-xs sm:text-sm font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete Report</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: STUDENT FEEDBACK MANAGEMENT */}
        {activeTab === "feedback" && (
          <div className="space-y-4">
            <div className="rounded-3xl border-2 border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span>Campus Student Feedback Table</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold">
                      {filteredFeedback.length} entries
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Live feedback records from table <code className="font-mono text-purple-600 dark:text-purple-400">feedback</code> linked with <code className="font-mono text-purple-600 dark:text-purple-400">users</code>, <code className="font-mono text-purple-600 dark:text-purple-400">claim</code>, and <code className="font-mono text-purple-600 dark:text-purple-400">found_item</code>
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100 dark:bg-neutral-800 border-b-2 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-bold uppercase text-xs sm:text-sm tracking-wider">
                    <tr>
                      <th className="py-4 px-5">ID & Student</th>
                      <th className="py-4 px-5">Rating</th>
                      <th className="py-4 px-5">Category</th>
                      <th className="py-4 px-5">Comments</th>
                      <th className="py-4 px-5">Linked Item / Claim</th>
                      <th className="py-4 px-5">Date</th>
                      <th className="py-4 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-white/10">
                    {filteredFeedback.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-sm font-semibold text-neutral-500">
                          No student feedback matches your search &quot;{searchQuery}&quot;.
                        </td>
                      </tr>
                    ) : (
                      filteredFeedback.map((f: any) => (
                        <tr key={f.feedback_id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                          <td className="py-4 px-5">
                            <span className="font-mono font-extrabold text-sm text-neutral-950 dark:text-white">
                              #{f.feedback_id}
                            </span>
                            <p className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white mt-0.5">
                              {f.student_name || "Student"}
                            </p>
                            <span className="font-mono text-[11px] text-neutral-500">
                              PRN: {f.prn_number || "Verified"}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-4 w-4 ${
                                    s <= Number(f.rating)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-neutral-300 dark:text-neutral-600"
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                {f.rating}/5
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="text-xs px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold">
                              {f.category}
                            </span>
                          </td>
                          <td className="py-4 px-5 max-w-xs">
                            <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 line-clamp-3">
                              {f.comments}
                            </p>
                          </td>
                          <td className="py-4 px-5">
                            {f.claim_code ? (
                              <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                {f.claim_code}
                              </span>
                            ) : f.item_title ? (
                              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                {f.item_title}
                              </span>
                            ) : (
                              <span className="text-xs text-neutral-400 italic">General</span>
                            )}
                          </td>
                          <td className="py-4 px-5 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                            {f.created_at ? new Date(f.created_at).toLocaleDateString() : "Recent"}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              f.status === "Reviewed"
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                            }`}>
                              {f.status || "Submitted"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
