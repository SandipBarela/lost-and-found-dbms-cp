"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  Check, 
  MapPin, 
  Calendar,
  CheckCircle2, 
  PlusCircle,
  Tag,
  ArrowRight
} from "lucide-react";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onSelectPair?: (lostItem: any, foundItem: any) => void;
  onOpenReport?: () => void;
  isMyReport?: (item: any) => boolean;
}

const DEFAULT_FOUND_ITEMS = [
  {
    id: 5,
    type: "found",
    title: "HP Victus 15 Gaming Laptop (Mica Silver / Black)",
    location: "Library 2nd Floor",
    date: "Today, 11:30 AM",
    category: "Laptops & Accessories",
    prnNumber: "1032210871",
    division: "Central Library Desk",
    description: "Black 15.6-inch HP Victus gaming laptop with backlit keyboard, Intel Core i7, Windows 11. Left on study table 14 near reading cubicles. Deposited at Library Desk.",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
    status: "In Safekeeping"
  },
  {
    id: 7,
    type: "found",
    title: "Dell XPS 15 Silver Laptop with Charger",
    location: "Engineering Hall B-104",
    date: "Oct 30",
    category: "Laptops & Accessories",
    prnNumber: "1032210992",
    division: "Div C - CS",
    description: "Found in Hall B-104 row 4. Dell XPS laptop with 130W charger adapter.",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
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
    description: "Contains a metro card, 2 bank cards, and student gym pass. Handed over to security desk counter 2.",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
    status: "In Safekeeping"
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

// Fallback images for found items if image URL fails to load
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "ID Cards & Wallets": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
  "Laptops & Accessories": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
  "Electronics": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
  "Keys & Badges": "https://images.unsplash.com/photo-1666346166849-8443c47f50fa?auto=format&fit=crop&w=600&q=80",
  "Clothing & Bags": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
  "Books & Stationery": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
  "Other": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"
};

export default function MatchModal({ 
  isOpen, 
  onClose, 
  items, 
  onSelectPair, 
  onOpenReport, 
  isMyReport 
}: MatchModalProps) {
  const [selectedLostId, setSelectedLostId] = useState<number | null>(null);

  if (!isOpen) return null;

  // Filter ONLY manually entered lost items reported by the user
  const allLost = items.filter(i => i.type === "lost");
  const manuallyReportedLost = allLost.filter(item => {
    if (isMyReport && isMyReport(item)) return true;
    // Any manually created item has id > 50 or was created recently
    if (item.id > 50 || item.date === "Just now" || item.date?.includes("Today")) return true;
    // Check localStorage tracking
    try {
      const storedReports = localStorage.getItem("lf_my_reports");
      if (storedReports) {
        const set = new Set(JSON.parse(storedReports));
        if (set.has(`lost-${item.id}`) || set.has(String(item.id))) return true;
      }
    } catch {}
    return false;
  });

  // Prepare inventory of found items
  const incomingFound = items.filter(i => i.type === "found");
  const seenIds = new Set(incomingFound.map(i => i.id));
  const foundItems = [
    ...incomingFound,
    ...DEFAULT_FOUND_ITEMS.filter(d => !seenIds.has(d.id))
  ];

  // Active selected lost item: defaults to first manually entered lost item
  const activeLostItem = manuallyReportedLost.find(i => i.id === selectedLostId) 
    || (manuallyReportedLost.length > 0 ? manuallyReportedLost[0] : null);

  // AI Matching Score Calculator
  const getAiScore = (found: any, lost: any) => {
    if (!lost) return 30;
    const q = `${lost.title} ${lost.description || ""} ${lost.category || ""} ${lost.location || ""}`.toLowerCase();
    const t = `${found.title} ${found.description || ""} ${found.category || ""} ${found.location || ""}`.toLowerCase();

    const isLaptopQ = /laptop|victus|gaming|notebook|macbook|dell|hp|charger/.test(q);
    const isLaptopT = /laptop|victus|gaming|notebook|macbook|dell|hp|charger/.test(t) || found.category === "Laptops & Accessories";

    const isWatchQ = /watch|smartwatch|apple watch/.test(q);
    const isWatchT = /watch|smartwatch|apple watch/.test(t);

    const isWalletQ = /wallet|card|bifold|cash|purse/.test(q) || lost.category === "ID Cards & Wallets";
    const isWalletT = /wallet|card|bifold|cash|purse/.test(t) || found.category === "ID Cards & Wallets";

    const isMouseQ = /mouse|cursor|wireless mouse|logitech/.test(q);
    const isMouseT = /mouse|cursor|wireless mouse|logitech/.test(t);

    // Distinct category mismatch penalty
    if (isWalletQ && (isLaptopT || isWatchT || /key|fob/.test(t))) return 15;
    if (isLaptopQ && (isWalletT || /key|fob/.test(t))) return 15;
    if (isWatchQ && (isLaptopT || isWalletT)) return 15;

    let score = 30;

    // Direct token overlap
    const tokens = q.split(/[\s,.-]+/).filter(w => w.length >= 3);
    let matches = 0;
    tokens.forEach(tk => {
      if (t.includes(tk)) matches++;
    });
    const tokenRatio = tokens.length > 0 ? matches / tokens.length : 0;
    score += Math.floor(tokenRatio * 40);

    // Boost for category match
    if (lost.category && found.category && lost.category.toLowerCase() === found.category.toLowerCase()) {
      score += 25;
    }

    // Boost for location proximity
    if (lost.location && found.location && (
      lost.location.toLowerCase().includes(found.location.toLowerCase()) ||
      found.location.toLowerCase().includes(lost.location.toLowerCase())
    )) {
      score += 15;
    }

    // High confidence boost for strong semantic category match
    if (isWalletQ && isWalletT) score = Math.max(score, 96);
    if (isLaptopQ && isLaptopT) score = Math.max(score, 96);
    if (isMouseQ && isMouseT) score = Math.max(score, 94);

    return Math.min(98, Math.max(15, score));
  };

  // Rank found items against the currently selected manually reported item
  const rankedMatches = activeLostItem ? foundItems.map(found => {
    const score = getAiScore(found, activeLostItem);
    return { found, score };
  }).sort((a, b) => b.score - a.score) : [];

  return (
    <div 
      className="fixed inset-0 z-[100] overflow-y-auto p-3 sm:p-6 flex items-start sm:items-center justify-center editorial-modal-backdrop animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl my-auto rounded-[18px] editorial-modal-container flex flex-col text-[#1F2421] max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-[#E3DCD0] flex items-center justify-between bg-[#FAF7F2] sticky top-0 z-20">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-[#EFE6D8] text-[#7C4A2D] border border-[#DFD1BC] flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="h-6 w-6 text-[#7C4A2D]" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-[-0.025em] text-[#1F2421]">
                AI Match for Your Reported Lost Items
              </h2>
              <p className="text-xs sm:text-sm text-[#5A625E] mt-0.5 font-sans">
                Automatically matches your reported lost belongings with found inventory using AI similarity scores.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2.5 rounded-xl text-[#5A625E] hover:text-[#1F2421] hover:bg-[#F2ECE1] transition-all cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Manually Reported Lost Items */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#1F2421]">
                    Your Reported Lost Items
                  </h3>
                  <p className="text-xs text-[#5A625E]">
                    Select an item to view its AI recommendations
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full badge-campus">
                  {manuallyReportedLost.length} Reported
                </span>
              </div>

              {manuallyReportedLost.length === 0 ? (
                /* Empty state when user hasn't reported an item yet */
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-[#CFC5B4] bg-white flex flex-col items-center justify-center">
                  <div className="h-14 w-14 rounded-2xl bg-[#EFE6D8] text-[#7C4A2D] flex items-center justify-center mb-3">
                    <PlusCircle className="h-7 w-7" />
                  </div>
                  <h4 className="font-serif text-base font-bold mb-1 text-[#1F2421]">
                    No Lost Items Reported Yet
                  </h4>
                  <p className="text-xs text-[#5A625E] mb-4 max-w-xs">
                    Report a lost item to automatically see instant AI recommendations against all found campus items.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenReport}
                    className="btn-tactile-primary px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Report a Lost Item Now</span>
                  </button>
                </div>
              ) : (
                /* List of user's manually entered lost items */
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {manuallyReportedLost.map(item => {
                    const isSelected = (activeLostItem?.id === item.id);
                    return (
                      <div
                        key={`my-lost-${item.id}`}
                        onClick={() => setSelectedLostId(item.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 bg-white ${
                          isSelected
                            ? "border-[#D95D39] shadow-tactile-card ring-2 ring-[#D95D39]/30"
                            : "border-[#E3DCD0] shadow-tactile-card hover:border-[#CFC5B4]"
                        }`}
                      >
                        <div className="h-20 w-20 sm:h-22 sm:w-22 rounded-xl overflow-hidden bg-[#F2ECE1] border border-[#CFC5B4] shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = CATEGORY_FALLBACK_IMAGES[item.category] || CATEGORY_FALLBACK_IMAGES["Other"];
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-mono font-bold badge-alert px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {item.category}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-[#D95D39] shrink-0" />
                            )}
                          </div>
                          <h4 className="font-serif font-bold text-base text-[#1F2421] truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[#5A625E] truncate flex items-center gap-1 mt-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D95D39]" />
                            <span>{item.location}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: AI Recommended Matches */}
            <div className="md:col-span-7 flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E3DCD0]">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#1F2421] flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#D95D39]" />
                    <span>AI Recommended Matches</span>
                  </h3>
                  {activeLostItem && (
                    <p className="text-xs text-[#5A625E]">
                      Matched for: <strong className="text-[#1F2421]">&ldquo;{activeLostItem.title}&rdquo;</strong>
                    </p>
                  )}
                </div>
                {activeLostItem && (
                  <span className="text-xs font-mono font-medium text-[#5A625E]">
                    {rankedMatches.length} Found Items Evaluated
                  </span>
                )}
              </div>

              {!activeLostItem ? (
                <div className="p-12 text-center rounded-2xl border-2 border-dashed border-[#CFC5B4] bg-white text-[#5A625E]">
                  <p className="text-sm">Select one of your reported lost items on the left to see recommendations.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1.5">
                  {rankedMatches.map(({ found, score }) => {
                    const isTopMatch = score >= 85;

                    return (
                      <div
                        key={`match-rec-${found.id}`}
                        className="p-5 rounded-2xl border border-[#E3DCD0] bg-white shadow-tactile-card space-y-4"
                      >
                        {/* Top banner if strong match */}
                        {isTopMatch && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg badge-verified text-xs font-mono font-bold">
                            <Sparkles className="h-4 w-4 text-[#225444]" />
                            <span>TOP RECOMMENDED MATCH ({score}% CONFIDENCE)</span>
                          </div>
                        )}

                        {/* Large Image & Clear Typography */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl overflow-hidden bg-[#F2ECE1] shrink-0 border border-[#CFC5B4]">
                            <img 
                              src={found.image} 
                              alt={found.title} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = CATEGORY_FALLBACK_IMAGES[found.category] || CATEGORY_FALLBACK_IMAGES["Other"];
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-xs font-mono uppercase font-bold text-[#5A625E]">
                                Found Record #{found.id}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-mono font-bold ${
                                isTopMatch
                                  ? "badge-verified"
                                  : "badge-campus"
                              }`}>
                                {score}% AI Match
                              </span>
                            </div>

                            <h4 className="font-serif font-bold text-base sm:text-lg text-[#1F2421] leading-snug">
                              {found.title}
                            </h4>

                            <p className="text-xs sm:text-sm text-[#5A625E] leading-relaxed mt-1 line-clamp-2">
                              {found.description}
                            </p>
                            
                            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[#5A625E]">
                              <span className="flex items-center gap-1 font-medium text-[#1F2421]">
                                <MapPin className="h-3.5 w-3.5 text-[#D95D39]" />
                                <span>{found.location}</span>
                              </span>
                              <span>•</span>
                              <span className="font-mono badge-campus px-2 py-0.5 rounded-md">
                                {found.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => onSelectPair?.(activeLostItem, found)}
                          className="btn-tactile-primary w-full py-3 px-6 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                          <span>This is my item! Verify & Retrieve →</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
