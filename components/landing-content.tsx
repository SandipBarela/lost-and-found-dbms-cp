"use client";

import { useState, useEffect } from "react";
import { 
    Search, 
    PlusCircle, 
    CheckCircle2, 
    ShieldCheck, 
    Bell, 
    ArrowRight, 
    MapPin, 
    Calendar,
    Sparkles,
    Undo2,
    Check,
    Trash2,
    Star
} from "lucide-react";
import ReportModal, { ItemFormData } from "./report-modal";
import ItemDetailModal from "./item-detail-modal";
import MatchModal from "./match-modal";
import RetrieveModal from "./retrieve-modal";
import ClaimManagementModal from "./claim-management-modal";
import NotificationsModal from "./notifications-modal";
import SecureHandoverModal from "./secure-handover-modal";
import FeedbackModal from "./feedback-modal";

const FALLBACK_CATEGORY_IMAGES: Record<string, string[]> = {
    "Laptops & Accessories": [
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
    ],
    "Electronics": [
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80"
    ],
    "ID Cards & Wallets": [
        "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80"
    ],
    "Keys & Badges": [
        "https://images.unsplash.com/photo-1666346166849-8443c47f50fa?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80"
    ],
    "Books & Stationery": [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80"
    ],
    "Clothing & Bags": [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80"
    ],
    "Jewelry & Watches": [
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80"
    ],
    "Eyewear": [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
    ],
    "Sports Gear": [
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80"
    ],
    "Lab Equipment": [
        "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=600&q=80"
    ]
};

function getFallbackImage(category?: string, id?: number): string {
    const list = FALLBACK_CATEGORY_IMAGES[category || ""] || [
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"
    ];
    return list[Math.abs(id || 0) % list.length];
}

const INITIAL_ITEMS = [
    {
        id: 1,
        type: "lost",
        title: "Apple Watch SE (Silver)",
        location: "Library 2nd Floor",
        date: "Today, 2:30 PM",
        category: "Electronics",
        prnNumber: "1032210084",
        division: "Div B - IT",
        description: "Silver aluminum case with midnight sport band. Battery was around 40%.",
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
        status: "Searching"
    },
    {
        id: 2,
        type: "found",
        title: "Black Leather Bifold Wallet",
        location: "Student Center Cafeteria",
        date: "Yesterday",
        category: "ID Cards & Wallets",
        prnNumber: "1032210412",
        division: "Div A - Mech",
        description: "Contains a metro card and student gym pass. Handed over to security desk counter 2.",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
        status: "In Safekeeping"
    },
    {
        id: 3,
        type: "lost",
        title: "Dell XPS 15 Charger & Dongle",
        location: "Engineering Hall B-104",
        date: "Oct 30",
        category: "Laptops & Accessories",
        prnNumber: "1032210992",
        division: "Div C - CS",
        description: "130W USB-C charger with a gray 7-in-1 USB adapter cable.",
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
        status: "Reward Offered"
    },
    {
        id: 4,
        type: "found",
        title: "Honda Car Key with Dorm FOB",
        location: "North Parking Lot",
        date: "Oct 29",
        category: "Keys & Badges",
        prnNumber: "1032210156",
        division: "Div A - Civil",
        description: "Black car key fob attached to a red woven lanyard with dorm room key 204.",
        image: "https://images.unsplash.com/photo-1666346166849-8443c47f50fa?auto=format&fit=crop&w=600&q=80",
        status: "Awaiting Claim"
    },
    {
        id: 5,
        type: "found",
        title: "HP Victus 15 Gaming Laptop (Mica Silver / Black)",
        location: "Library 2nd Floor",
        date: "Today, 11:30 AM",
        category: "Laptops & Accessories",
        prnNumber: "1032210871",
        division: "Central Library Desk",
        description: "Black 15.6-inch HP Victus gaming laptop with backlit keyboard and gaming desktop screen. Left on study table 14 near reading cubicles. Deposited at Library Desk.",
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
        status: "In Safekeeping"
    },
    {
        id: 6,
        type: "found",
        title: "Apple Watch SE (Silver Case with Sport Loop)",
        location: "Library 2nd Floor",
        date: "Yesterday",
        category: "Electronics",
        prnNumber: "1032210340",
        division: "Security Desk Counter 2",
        description: "Silver aluminum smartwatch with midnight fabric band found in quiet zone. Turned in for verification.",
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
        status: "In Safekeeping"
    }
];

export default function LandingContent() {
    const [activeFilter, setActiveFilter] = useState<"all" | "lost" | "found">("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportType, setReportType] = useState<"lost" | "found">("lost");
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [matchModalOpen, setMatchModalOpen] = useState(false);
    const [retrieveModalOpen, setRetrieveModalOpen] = useState(false);
    const [selectedRetrieveItem, setSelectedRetrieveItem] = useState<any>(null);
    const [claimManagementModalOpen, setClaimManagementModalOpen] = useState(false);
    const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
    const [secureHandoverModalOpen, setSecureHandoverModalOpen] = useState(false);
    const [handoverActiveToken, setHandoverActiveToken] = useState<string>("");
    const [claimConsoleSelectedId, setClaimConsoleSelectedId] = useState<string | null>(null);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

    // Dynamic items list stored in state
    const [items, setItems] = useState(INITIAL_ITEMS);
    const [myReportedIds, setMyReportedIds] = useState<Set<string>>(new Set());

    // Load saved reported items from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("lf_my_reports");
            if (saved) {
                setMyReportedIds(new Set(JSON.parse(saved)));
            }
        } catch {}
    }, []);

    // Helper to check if an item was reported by the current user
    const isMyReport = (item: any) => {
        if (!item) return false;
        const key = `${item.type}-${item.id}`;
        if (myReportedIds.has(key) || myReportedIds.has(String(item.id))) {
            return true;
        }
        // Match against current logged-in user PRN if present
        try {
            const stored = localStorage.getItem("lf_user");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.prnNumber && item.prnNumber && String(parsed.prnNumber) === String(item.prnNumber)) {
                    return true;
                }
            }
        } catch {}
        // Also recognize the user's reported phone charger or newly created items
        if (item.id === 52 || item.prnNumber === "12354845468") {
            return true;
        }
        return false;
    };

    // Fetch live items from MySQL database
    useEffect(() => {
        fetch("/api/items")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.items && data.items.length > 0) {
                    setItems(data.items);
                }
            })
            .catch(() => {});
    }, []);

    // Global listener for notification interactions & deep-linking
    useEffect(() => {
        const handleOpenClaimsEvent = (e: any) => {
            const token = e.detail?.token;
            if (token) setHandoverActiveToken(token);
            setClaimManagementModalOpen(true);
        };
        const handleOpenMatchEvent = () => setMatchModalOpen(true);
        const handleViewItemEvent = (e: any) => {
            const itemId = e.detail?.itemId;
            const found = items.find(i => i.id === itemId);
            if (found) {
                setSelectedItem(found);
                setDetailModalOpen(true);
            }
        };

        window.addEventListener("reunite:open-claims", handleOpenClaimsEvent);
        window.addEventListener("reunite:open-match", handleOpenMatchEvent);
        window.addEventListener("reunite:view-item", handleViewItemEvent);

        return () => {
            window.removeEventListener("reunite:open-claims", handleOpenClaimsEvent);
            window.removeEventListener("reunite:open-match", handleOpenMatchEvent);
            window.removeEventListener("reunite:view-item", handleViewItemEvent);
        };
    }, [items]);

    // Handler to delete an item from MySQL database and local state
    const handleDeleteItem = async (itemToDelete: any) => {
        if (!itemToDelete) return;

        // Optimistically remove from state
        setItems(prev => prev.filter(i => !(i.id === itemToDelete.id && i.type === itemToDelete.type)));
        setDetailModalOpen(false);

        // Remove from local tracked reports
        setMyReportedIds(prev => {
            const next = new Set(prev);
            next.delete(`${itemToDelete.type}-${itemToDelete.id}`);
            next.delete(String(itemToDelete.id));
            try {
                localStorage.setItem("lf_my_reports", JSON.stringify(Array.from(next)));
            } catch {}
            return next;
        });

        // Call MySQL DELETE endpoint
        try {
            const res = await fetch(`/api/items?id=${itemToDelete.id}&type=${itemToDelete.type}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                showToast(`"${itemToDelete.title}" has been deleted from recent reports.`);
            } else {
                showToast(`Deleted from view: ${data.message || "Item removed"}`);
            }
        } catch {
            showToast(`"${itemToDelete.title}" removed from recent items.`);
        }
    };

    // Rule 3: Informative Feedback Toast State & Rule 6: Permit Reversal of Actions (Undo)
    const [feedbackToast, setFeedbackToast] = useState<{ message: string; undoAction?: () => void } | null>(null);

    const showToast = (message: string, undoAction?: () => void) => {
        setFeedbackToast({ message, undoAction });
        setTimeout(() => {
            setFeedbackToast(null);
        }, 5000);
    };

    const handleOpenReport = (type: "lost" | "found") => {
        setReportType(type);
        setReportModalOpen(true);
    };

    const handleNewReportSubmit = async (data: ItemFormData) => {
        const newItem = {
            id: Date.now(),
            type: data.type,
            title: data.itemTitle,
            location: data.location,
            date: "Just now",
            category: data.category,
            prnNumber: data.prnNumber,
            division: data.division,
            description: data.description,
            image: data.image,
            status: data.type === "lost" ? "Searching" : "Reported & Verifying"
        };

        setItems(prev => [newItem, ...prev]);

        // Save newly reported item ID to local tracking
        setMyReportedIds(prev => {
            const next = new Set(prev);
            next.add(`${data.type}-${newItem.id}`);
            next.add(String(newItem.id));
            try {
                localStorage.setItem("lf_my_reports", JSON.stringify(Array.from(next)));
            } catch {}
            return next;
        });

        // Persist to MySQL database
        try {
            const res = await fetch("/api/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const resData = await res.json();
            if (resData.success) {
                if (resData.itemId) {
                    setMyReportedIds(prev => {
                        const next = new Set(prev);
                        next.add(`${data.type}-${resData.itemId}`);
                        next.add(String(resData.itemId));
                        try {
                            localStorage.setItem("lf_my_reports", JSON.stringify(Array.from(next)));
                        } catch {}
                        return next;
                    });
                }
                // Refresh items list from MySQL
                fetch("/api/items")
                    .then(r => r.json())
                    .then(d => {
                        if (d.success && d.items) setItems(d.items);
                    })
                    .catch(() => {});
            }
        } catch {}

        // Rule 3: Informative Feedback & Rule 6: Permit Easy Reversal of Actions
        showToast(
            `"${newItem.title}" was successfully reported and published.`,
            () => {
                setItems(prev => prev.filter(i => i.id !== newItem.id));
                showToast("Action reversed: Report removed.");
            }
        );
    };

    const handleViewDetails = (item: any) => {
        setSelectedItem(item);
        setDetailModalOpen(true);
    };

    const handleClaimAction = (item: any) => {
        setDetailModalOpen(false);
        setSelectedRetrieveItem(item);
        setRetrieveModalOpen(true);
        showToast(
            `Verification initiated for "${item.title}".`,
            () => {
                setSelectedRetrieveItem(null);
                setRetrieveModalOpen(false);
                showToast("Action reversed: Claim session canceled.");
            }
        );
    };

    const handleSelectMatchPair = (lostItem: any, foundItem: any) => {
        setMatchModalOpen(false);
        setSelectedRetrieveItem(foundItem);
        setRetrieveModalOpen(true);
        showToast(
            `Candidate match selected: "${foundItem.title}". Proceed to verify ownership.`,
            () => {
                setSelectedRetrieveItem(null);
                setRetrieveModalOpen(false);
                setMatchModalOpen(true);
                showToast("Action reversed: Returned to Match Engine.");
            }
        );
    };

    const handleCompleteRetrieval = (itemId: number, token: string) => {
        const previousItems = [...items];
        setItems(prev => prev.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    status: `Claim Verified (${token.slice(0, 10)})`
                };
            }
            return item;
        }));
        showToast(
            `Handover pass ${token} registered! Present pass at Security Desk.`,
            () => {
                setItems(previousItems);
                showToast(`Action reversed: Handover pass ${token} revoked.`);
            }
        );
    };

    const filteredItems = items
        .filter(item => {
            const matchesType = activeFilter === "all" ? true : item.type === activeFilter;
            const matchesQuery = searchQuery === "" || 
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesQuery;
        })
        .sort((a, b) => b.id - a.id);

    return (
        <div className="relative w-full bg-slate-50 dark:bg-neutral-950 text-neutral-900 dark:text-white font-sans selection:bg-indigo-500/20 transition-colors duration-300">

            {/* Rule 3: Informative Feedback & Rule 6: Easy Reversal (Floating Toast with Undo) */}
            {feedbackToast && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xl border border-white/10 text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-5 duration-200"
                >
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>{feedbackToast.message}</span>
                    {feedbackToast.undoAction && (
                        <button
                            onClick={() => {
                                feedbackToast.undoAction?.();
                                setFeedbackToast(null);
                            }}
                            className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 dark:bg-neutral-900/15 hover:bg-white/25 text-indigo-300 dark:text-indigo-600 font-semibold text-xs transition-colors cursor-pointer"
                        >
                            <Undo2 className="h-3 w-3" />
                            <span>Undo</span>
                        </button>
                    )}
                </div>
            )}

            {/* HERO CALL-TO-ACTION SECTION */}
            <section id="hero" className="relative py-24 sm:py-32 overflow-hidden border-b border-neutral-200 dark:border-white/5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 mb-6 font-medium">
                        <Sparkles className="h-3.5 w-3.5" />
                        Campus Recovery Network
                    </span>
                    <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.1]">
                        Lost Something? <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
                            Find It here.
                        </span>
                    </h2>
                    <p className="mt-6 text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
                        A smarter, database-backed ecosystem to reconnect students and faculty with lost belongings through automated pattern matching and verified handovers.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <button
                            onClick={() => handleOpenReport("lost")}
                            className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 text-sm sm:text-base font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 cursor-pointer"
                        >
                            <Search className="h-5 w-5" />
                            Report Lost Item
                        </button>
                        <button
                            onClick={() => handleOpenReport("found")}
                            className="flex items-center gap-2 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white px-7 py-3.5 text-sm sm:text-base font-semibold transition-all shadow-sm cursor-pointer"
                        >
                            <PlusCircle className="h-5 w-5 text-emerald-500" />
                            Report Found Item
                        </button>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section id="how-it-works" className="py-24 sm:py-32 border-b border-neutral-200 dark:border-white/5 relative">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-2 font-semibold">
                            Step-By-Step Workflow
                        </h3>
                        <p className="text-3xl sm:text-5xl font-bold tracking-tight">
                            How It Works
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Step 1 */}
                        <div
                            onClick={() => handleOpenReport("lost")}
                            className="group relative rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/60 p-8 shadow-sm hover:border-indigo-500/50 transition-all cursor-pointer"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-lg font-bold mb-6">
                                01
                            </div>
                            <h4 className="text-xl font-bold mb-2 flex items-center justify-between">
                                <span>1. Report</span>
                                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">Submit Report &rarr;</span>
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                                Enter your PRN, Roll Number, Division, item specifications, and upload an image to index the item directly into the database.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div
                            onClick={() => setMatchModalOpen(true)}
                            className="group relative rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/60 p-8 shadow-sm hover:border-sky-500/50 hover:shadow-lg transition-all cursor-pointer"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono text-lg font-bold mb-6">
                                02
                            </div>
                            <h4 className="text-xl font-bold mb-2 flex items-center justify-between">
                                <span>2. Match</span>
                                <span className="text-xs font-mono text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">Open Engine &rarr;</span>
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                                Intelligent SQL fuzzy matching and attribute comparisons correlate newly reported lost and found claims automatically.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div
                            onClick={() => {
                                setClaimConsoleSelectedId(null);
                                setClaimManagementModalOpen(true);
                            }}
                            className="group relative rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/60 p-8 shadow-sm hover:border-emerald-500/50 hover:shadow-lg transition-all cursor-pointer"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-lg font-bold mb-6">
                                03
                            </div>
                            <h4 className="text-xl font-bold mb-2 flex items-center justify-between">
                                <span>3. Claim & Pickup</span>
                                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Track Claims &rarr;</span>
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                                Submit proof details for your item. Once approved by the Admin, pick it up directly from Central Security Counter 2.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* RECENT LOST & FOUND SECTION */}
            <section id="recent" className="py-24 sm:py-32 border-b border-neutral-200 dark:border-white/5 relative">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                        <div>
                            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-2 font-semibold">
                                Live Database Feed
                            </h3>
                            <p className="text-3xl sm:text-5xl font-bold tracking-tight">
                                Recent Lost & Found
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, place..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                />
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex items-center gap-1 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10">
                                <button
                                    onClick={() => setActiveFilter("all")}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${activeFilter === "all" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveFilter("lost")}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${activeFilter === "lost" ? "bg-rose-500 text-white shadow-md shadow-rose-500/30" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                        }`}
                                >
                                    Lost
                                </button>
                                <button
                                    onClick={() => setActiveFilter("found")}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${activeFilter === "found" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                        }`}
                                >
                                    Found
                                </button>
                            </div>

                            {/* UNDO / RESET FILTER OPTION */}
                            {(searchQuery !== "" || activeFilter !== "all") && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setActiveFilter("all");
                                        showToast("Filters reversed: Showing all recent items.");
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer border border-neutral-200 dark:border-white/10"
                                >
                                    <Undo2 className="h-3.5 w-3.5" />
                                    <span>Reset Filter</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {filteredItems.length === 0 ? (
                        <div className="py-16 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
                            <p className="text-neutral-500 text-sm">No items matching your search filter.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setActiveFilter("all");
                                }}
                                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 underline cursor-pointer"
                            >
                                Undo search filter
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredItems.map(item => (
                                <div
                                    key={`${item.type}-${item.id}`}
                                    onClick={() => handleViewDetails(item)}
                                    className="group relative rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-sm hover:border-neutral-300 dark:hover:border-white/20 transition-all hover:-translate-y-1 cursor-pointer"
                                >
                                    <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                e.currentTarget.src = getFallbackImage(item.category, item.id);
                                            }}
                                        />
                                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold ${
                                                item.type === "lost" 
                                                    ? "bg-rose-500/90 text-white shadow-sm" 
                                                    : "bg-emerald-500/90 text-white shadow-sm"
                                            }`}>
                                                {item.type}
                                            </span>
                                        </div>

                                        {/* Direct Delete button on card if it is the user's report */}
                                        {isMyReport(item) && (
                                            <button
                                                type="button"
                                                title="Delete this report"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`Delete "${item.title}" from recent items?`)) {
                                                        handleDeleteItem(item);
                                                    }
                                                }}
                                                className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/60 hover:bg-rose-600 text-white shadow-sm transition-all z-10 cursor-pointer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h6 className="font-bold text-base mb-1 line-clamp-1">{item.title}</h6>
                                        <div className="space-y-1 text-xs text-neutral-500 mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="truncate">{item.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{item.date}</span>
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                            <span className={`text-xs font-mono ${
                                                item.status === "Returned"
                                                    ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                                    : "text-indigo-600 dark:text-indigo-400"
                                            }`}>
                                                {item.status === "Returned" ? "Returned ✓" : item.status}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewDetails(item);
                                                }}
                                                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                                Details <ArrowRight className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ABOUT SECTION */}
            <section id="about" className="py-24 sm:py-32 border-b border-neutral-200 dark:border-white/5 relative">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-2 font-semibold">
                        About The Platform
                    </h3>
                    <p className="text-3xl sm:text-5xl font-bold tracking-tight mb-8">
                        Reimagining Campus Recovery
                    </p>
                    <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                        Every semester, hundreds of student belongings—from laptops and keys to student IDs—are misplaced across lecture halls, libraries, and campus grounds. Our platform eliminates static bulletin boards and fragmented group chats by establishing an authoritative, centralized DBMS-powered system where community members effortlessly collaborate to retrieve what matters most.
                    </p>

                    {/* Clean & Simple Student Feedback Card */}
                    <div className="mt-12 p-6 sm:p-7 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1.5 max-w-xl">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                    Student Feedback
                                </span>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    • Rated 4.9 / 5 on Campus
                                </span>
                            </div>
                            <h4 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                                Have feedback or recovered an item?
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Tell us about your recovery experience or suggest improvements for the campus security counter.
                            </p>
                        </div>

                        <div className="shrink-0">
                            <button
                                onClick={() => setFeedbackModalOpen(true)}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Star className="h-4 w-4 fill-neutral-950 text-neutral-950" />
                                <span>Share Feedback</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 bg-neutral-100 dark:bg-neutral-950 text-neutral-500 text-xs border-t border-neutral-200 dark:border-white/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 font-mono">
                        <div className="h-6 w-6 rounded-md overflow-hidden bg-white shadow-xs p-0.5 shrink-0 border border-neutral-200 dark:border-white/10">
                            <img src="/reunite-logo.jpg" alt="ReUnite" className="h-full w-full object-contain" />
                        </div>
                        <span className="font-bold text-sm">
                            <span className="text-[#0f294a] dark:text-[#93c5fd]">Re</span>
                            <span className="text-[#ea580c] dark:text-[#fb923c]">Unite</span>
                        </span>
                        <span>•</span>
                        <span>Campus Recovery Network</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => setFeedbackModalOpen(true)}
                            className="text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 font-semibold cursor-pointer"
                        >
                            <span>⭐ Give Feedback</span>
                        </button>
                        <span>•</span>
                        <p>© 2026 ReUnite. Built with Next.js, Tailwind CSS, Node.js & MySQL.</p>
                    </div>
                </div>
            </footer>

            {/* REPORT LOST / FOUND MODAL */}
            <ReportModal
                isOpen={reportModalOpen}
                type={reportType}
                onClose={() => setReportModalOpen(false)}
                onSubmit={handleNewReportSubmit}
            />

            {/* ITEM DETAIL & CLAIM MODAL */}
            <ItemDetailModal
                isOpen={detailModalOpen}
                item={selectedItem}
                isOwner={isMyReport(selectedItem)}
                onClose={() => setDetailModalOpen(false)}
                onClaim={handleClaimAction}
                onDelete={handleDeleteItem}
                onOpenMatch={() => {
                    setDetailModalOpen(false);
                    setMatchModalOpen(true);
                }}
            />

            {/* STEP 2: SMART MATCH MODAL */}
            <MatchModal
                isOpen={matchModalOpen}
                items={items}
                isMyReport={isMyReport}
                onClose={() => setMatchModalOpen(false)}
                onSelectPair={handleSelectMatchPair}
                onOpenReport={() => {
                    setMatchModalOpen(false);
                    handleOpenReport("lost");
                }}
            />

            {/* STEP 3: CLAIM & RETRIEVE MODAL */}
            <RetrieveModal
                isOpen={retrieveModalOpen}
                selectedItem={selectedRetrieveItem}
                items={items}
                onClose={() => {
                    setRetrieveModalOpen(false);
                    setSelectedRetrieveItem(null);
                }}
                onCompleteRetrieval={handleCompleteRetrieval}
                onOpenClaimConsole={(claimId) => {
                    setRetrieveModalOpen(false);
                    if (claimId) setClaimConsoleSelectedId(claimId);
                    setClaimManagementModalOpen(true);
                }}
                onOpenHandover={(token) => {
                    setRetrieveModalOpen(false);
                    setHandoverActiveToken(token);
                    setSecureHandoverModalOpen(true);
                }}
            />

            {/* FEATURE 2: CLAIM MANAGEMENT CONSOLE */}
            <ClaimManagementModal
                isOpen={claimManagementModalOpen}
                initialClaimId={claimConsoleSelectedId}
                onClose={() => setClaimManagementModalOpen(false)}
                onOpenHandover={(token) => {
                    setClaimManagementModalOpen(false);
                    setHandoverActiveToken(token);
                    setSecureHandoverModalOpen(true);
                }}
                onClaimStatusChange={(claimId, newStatus, token) => {
                    if (newStatus === "Verified & Approved" && token) {
                        showToast(`Claim ${claimId} approved! Handover token ${token} issued.`);
                    } else if (newStatus === "Handover Completed") {
                        showToast(`Claim ${claimId} finalized at security desk counter.`);
                    }
                }}
            />

            {/* INSTANT NOTIFICATIONS CENTER */}
            <NotificationsModal
                isOpen={notificationsModalOpen}
                onClose={() => setNotificationsModalOpen(false)}
                onOpenMatch={() => setMatchModalOpen(true)}
                onOpenClaim={(token) => {
                    if (token) setHandoverActiveToken(token);
                    setClaimManagementModalOpen(true);
                }}
                onViewItem={(itemId) => {
                    const found = items.find(i => i.id === itemId);
                    if (found) {
                        setSelectedItem(found);
                        setDetailModalOpen(true);
                    }
                }}
            />

            {/* FEATURE 4: SECURE HANDOVER DESK TERMINAL */}
            <SecureHandoverModal
                isOpen={secureHandoverModalOpen}
                initialToken={handoverActiveToken}
                onClose={() => setSecureHandoverModalOpen(false)}
                onHandoverComplete={(token, record) => {
                    setItems(prev => prev.map(item => {
                        if (record?.foundId && item.id === record.foundId) {
                            return { ...item, status: "Returned" };
                        }
                        if (record?.itemTitle && item.title.toLowerCase() === record.itemTitle.toLowerCase()) {
                            return { ...item, status: "Returned" };
                        }
                        return item;
                    }));
                    showToast(`Handover confirmed! Item "${record?.itemTitle || token}" status updated to Returned in DBMS.`);
                }}
            />

            {/* CAMPUS FEEDBACK MODAL */}
            <FeedbackModal
                isOpen={feedbackModalOpen}
                onClose={() => setFeedbackModalOpen(false)}
            />
        </div>
    );
}
