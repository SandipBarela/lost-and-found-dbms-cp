"use client";

import { useState } from "react";
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
    Layers,
    BookOpen
} from "lucide-react";
import ReportModal, { ItemFormData } from "./report-modal";
import ItemDetailModal from "./item-detail-modal";

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
        description: "Silver aluminum case with midnight blue sport loop. Lost near the study cubicles.",
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

    // Dynamic items list stored in state
    const [items, setItems] = useState(INITIAL_ITEMS);

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

    const handleNewReportSubmit = (data: ItemFormData) => {
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

        // Rule 3: Informative Feedback & Rule 6: Permit Easy Reversal of Actions (Undo newly created item)
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
        showToast(`Verification initiated for "${item.title}". Token logged to DBMS.`);
        setDetailModalOpen(false);
    };

    const filteredItems = items.filter(item => {
        const matchesType = activeFilter === "all" ? true : item.type === activeFilter;
        const matchesQuery = searchQuery === "" || 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesQuery;
    });

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
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 mb-6 font-semibold">
                        <Sparkles className="h-3.5 w-3.5" />
                        Campus Recovery Network
                    </span>
                    <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.05]">
                        Lost Something? <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 dark:from-indigo-400 dark:via-sky-300 dark:to-indigo-200 bg-clip-text text-transparent">
                            Find It here.
                        </span>
                    </h2>
                    <p className="mt-6 text-base sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
                        A smarter, database-backed ecosystem to reconnect students and faculty with lost belongings through automated pattern matching and verified handovers.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <button 
                            onClick={() => handleOpenReport("lost")}
                            className="flex items-center gap-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 text-sm sm:text-base font-semibold shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 cursor-pointer"
                        >
                            <Search className="h-4 w-4" />
                            Report Lost Item
                        </button>
                        <button 
                            onClick={() => handleOpenReport("found")}
                            className="flex items-center gap-2.5 rounded-2xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-800 dark:text-white px-7 py-3.5 text-sm sm:text-base font-semibold transition-all shadow-sm cursor-pointer"
                        >
                            <PlusCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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
                            className="group relative rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-8 shadow-sm hover:border-indigo-500/40 transition-all cursor-pointer"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono text-xl font-bold mb-6">
                                01
                            </div>
                            <h4 className="text-xl font-semibold mb-2 flex items-center justify-between">
                                <span>1. Report</span>
                                <span className="text-xs font-mono text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">Submit Report &rarr;</span>
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Enter your PRN, Roll Number, Division, item specifications, and upload an image to index the item directly into the database.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="group relative rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-8 shadow-sm hover:border-indigo-500/40 transition-all">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-mono text-xl font-bold mb-6">
                                02
                            </div>
                            <h4 className="text-xl font-semibold mb-2">2. Match</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Intelligent SQL fuzzy matching and attribute comparisons correlate newly reported lost and found claims automatically.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="group relative rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-8 shadow-sm hover:border-indigo-500/40 transition-all">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xl font-bold mb-6">
                                03
                            </div>
                            <h4 className="text-xl font-semibold mb-2">3. Retrieve</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Prove ownership through student identity and verification questions. Arrange verified handovers at campus counters.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" className="py-24 sm:py-32 border-b border-neutral-200 dark:border-white/5 relative">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-2 font-semibold">
                            Platform Capabilities
                        </h3>
                        <p className="text-3xl sm:text-5xl font-bold tracking-tight">
                            Core Features Built for Speed & Trust
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 p-6 shadow-sm hover:border-indigo-500/50 transition-all">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                                <Search className="h-5 w-5" />
                            </div>
                            <h5 className="font-semibold text-base mb-2">Item Matching</h5>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Fast SQL queries filter items by color, brand, location, and timeframe to suggest matches in real-time.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 p-6 shadow-sm hover:border-indigo-500/50 transition-all">
                            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <h5 className="font-semibold text-base mb-2">Claim Management</h5>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Multi-stage claim workflows ensure only legitimate owners can initiate retrieval claims.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 p-6 shadow-sm hover:border-indigo-500/50 transition-all">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                                <Bell className="h-5 w-5" />
                            </div>
                            <h5 className="font-semibold text-base mb-2">Instant Notifications</h5>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Get notified as soon as an item matching your lost description is handed in or registered.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 p-6 shadow-sm hover:border-indigo-500/50 transition-all">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <h5 className="font-semibold text-base mb-2">Secure Handover</h5>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Protected token handshakes prevent fraudulent pickups and maintain an immutable claim log.
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
                            {/* Rule 8: Reduce Memory Load - Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, place..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>

                            {/* Rule 8: Reduce Memory Load - Filter Tabs */}
                            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10">
                                <button
                                    onClick={() => setActiveFilter("all")}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                        activeFilter === "all" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveFilter("lost")}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                        activeFilter === "lost" ? "bg-rose-600 text-white shadow-md shadow-rose-600/30" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                    }`}
                                >
                                    Lost
                                </button>
                                <button
                                    onClick={() => setActiveFilter("found")}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                        activeFilter === "found" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                    }`}
                                >
                                    Found
                                </button>
                            </div>
                        </div>
                    </div>

                    {filteredItems.length === 0 ? (
                        <div className="py-16 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
                            <p className="text-neutral-500 text-sm">No items matching your search filter.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredItems.map(item => (
                                <div 
                                    key={item.id}
                                    onClick={() => handleViewDetails(item)}
                                    className="group relative rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-sm hover:border-indigo-500/50 transition-all hover:-translate-y-1 cursor-pointer"
                                >
                                    <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
                                        <img 
                                            src={item.image} 
                                            alt={item.title} 
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider font-semibold ${
                                            item.type === "lost" 
                                                ? "bg-rose-500 text-white" 
                                                : "bg-emerald-500 text-white"
                                        }`}>
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <h6 className="font-semibold text-base mb-2 line-clamp-1">{item.title}</h6>
                                        <div className="space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                                                <span className="truncate">{item.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                                                <span>{item.date}</span>
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
                                            <span className="text-[11px] font-mono font-medium text-indigo-600 dark:text-indigo-400">{item.status}</span>
                                            <button 
                                                type="button"
                                                className="text-xs font-medium text-neutral-700 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                                            >
                                                Details <ArrowRight className="h-3 w-3" />
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
                        Every semester, hundreds of essential belongings—from laptops and keys to student IDs—are misplaced across lecture halls, libraries, and campus grounds. Our platform eliminates static bulletin boards and fragmented group chats by establishing an authoritative, centralized DBMS-powered system where community members effortlessly collaborate to retrieve what matters most.
                    </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 bg-neutral-100 dark:bg-neutral-950 text-neutral-500 text-xs border-t border-neutral-200 dark:border-white/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-mono">
                        <span className="font-bold text-neutral-900 dark:text-white">Lost & Found DBMS</span>
                        <span>•</span>
                        <span>Campus Recovery Network</span>
                    </div>
                    <p>© 2026 Lost & Found DBMS. Built with Next.js, Tailwind CSS, Node.js & MySQL.</p>
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
                onClose={() => setDetailModalOpen(false)}
                onClaim={handleClaimAction}
            />
        </div>
    );
}
