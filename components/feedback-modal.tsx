"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Star, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ThumbsUp, 
  AlertCircle,
  Building2,
  Clock,
  User,
  Hash
} from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId?: number | null;
  foundId?: number | null;
  onSubmitted?: () => void;
}

const CATEGORIES = [
  "Platform Experience",
  "Counter Handover",
  "Item Recovery",
  "Feature Suggestion",
  "General Support"
];

const RATING_LABELS: Record<number, string> = {
  1: "Needs Improvement",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent! 🎉"
};

export default function FeedbackModal({
  isOpen,
  onClose,
  claimId,
  foundId,
  onSubmitted
}: FeedbackModalProps) {
  const [activeTab, setActiveTab] = useState<"write" | "reviews">("write");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<string>("Platform Experience");
  const [comments, setComments] = useState<string>("");
  const [prnNumber, setPrnNumber] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reviews list from database
  const [communityReviews, setCommunityReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalFeedback: number; averageRating: number; fiveStarCount: number } | null>(null);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage(null);
      setErrorMessage(null);
      return;
    }

    // Prefill from current user session
    const storedUser = localStorage.getItem("lf_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.prnNumber) setPrnNumber(u.prnNumber);
        if (u.displayName) setFullName(u.displayName);
      } catch (e) {}
    }

    fetchReviews();
  }, [isOpen]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      if (data.success) {
        setCommunityReviews(data.feedback || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      setErrorMessage("Please enter your feedback comments.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prnNumber: prnNumber.trim() || undefined,
          fullName: fullName.trim() || undefined,
          rating,
          category,
          comments: comments.trim(),
          claimId: claimId || undefined,
          foundId: foundId || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Thank you! Your feedback has been recorded in the database.");
        setComments("");
        fetchReviews();
        if (onSubmitted) onSubmitted();
      } else {
        setErrorMessage(data.error || "Failed to submit feedback.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Star className="h-5 w-5 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Campus Feedback & Ratings</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-medium">
                  DBMS Relational
                </span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Help us improve ReUnite campus lost & found experience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 px-6 pt-3 bg-neutral-50/40 dark:bg-neutral-900/40">
          <button
            onClick={() => setActiveTab("write")}
            className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "write"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Submit Feedback</span>
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "reviews"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>Community Reviews ({communityReviews.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === "write" ? (
            successMessage ? (
              <div className="text-center py-8 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Feedback Successfully Recorded!
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                  {successMessage}
                </p>
                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:underline"
                  >
                    Submit another response
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 shadow-sm transition-all"
                  >
                    View Community Reviews →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Rating Stars */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                    <span>Overall Experience Rating:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {RATING_LABELS[hoverRating || rating]}
                    </span>
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-neutral-100/70 dark:bg-neutral-800/60 rounded-xl justify-center sm:justify-start">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${
                            star <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-300 dark:text-neutral-600"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-sm font-bold text-neutral-700 dark:text-neutral-200">
                      {hoverRating || rating} / 5
                    </span>
                  </div>
                </div>

                {/* Category Chips */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Feedback Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                          category === cat
                            ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                            : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Your Comments & Suggestions *
                  </label>
                  <textarea
                    rows={4}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Tell us what you liked, how quick your item was matched, or what we can improve at the security counter..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                    required
                  />
                </div>

                {/* User Info (PRN and Name) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 mb-1">
                      <Hash className="h-3 w-3 text-neutral-400" />
                      <span>Student PRN (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={prnNumber}
                      onChange={(e) => setPrnNumber(e.target.value)}
                      placeholder="e.g. 1032210084"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 mb-1">
                      <User className="h-3 w-3 text-neutral-400" />
                      <span>Full Name (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sandip Barela"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                        <span>Saving to DBMS...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          ) : (
            /* COMMUNITY REVIEWS TAB */
            <div className="space-y-4">
              {/* Stats Summary Banner */}
              {stats && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-black text-amber-500">
                      {stats.averageRating}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${
                              s <= Math.round(stats.averageRating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-300 dark:text-neutral-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                        Based on {stats.totalFeedback} verified campus entries
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-white/70 dark:bg-neutral-800/70 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    ⭐ <strong>{stats.fiveStarCount}</strong> 5-star ratings recorded
                  </div>
                </div>
              )}

              {loadingReviews ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  Loading verified student reviews from MySQL...
                </div>
              ) : communityReviews.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  No feedback records found yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {communityReviews.map((item: any) => (
                    <div
                      key={item.feedback_id}
                      className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {item.student_name || `Student (${item.prn_number || "Verified"})`}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${
                                s <= item.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-neutral-300 dark:text-neutral-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 text-xs leading-relaxed">
                        {item.comments}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                        <span>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}
                        </span>
                        {item.admin_notes && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            ✓ {item.admin_notes}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
