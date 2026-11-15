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
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 editorial-modal-backdrop animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden editorial-modal-container flex flex-col text-[#1F2421]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E3DCD0] bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2ECE1] text-[#D95D39] border border-[#E3DCD0]">
              <Star className="h-5 w-5 fill-[#D95D39]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1F2421] flex items-center gap-2">
                <span>Campus Feedback & Ratings</span>
                <span className="badge-campus text-xs px-2 py-0.5 rounded-full font-mono font-medium">
                  DBMS Relational
                </span>
              </h2>
              <p className="text-xs text-[#5A625E]">
                Help us improve ReUnite campus lost & found experience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-tactile-secondary p-2 text-xs"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-[#E3DCD0] px-6 pt-3 bg-[#FAF7F2]">
          <button
            onClick={() => setActiveTab("write")}
            className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "write"
                ? "border-[#D95D39] text-[#D95D39]"
                : "border-transparent text-[#5A625E] hover:text-[#1F2421]"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Submit Feedback</span>
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "reviews"
                ? "border-[#D95D39] text-[#D95D39]"
                : "border-transparent text-[#5A625E] hover:text-[#1F2421]"
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
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E1EFE9] text-[#2D5A4C] border border-[#BFD9CE]">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1F2421]">
                  Feedback Successfully Recorded!
                </h3>
                <p className="text-sm text-[#5A625E] max-w-md mx-auto">
                  {successMessage}
                </p>
                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="btn-tactile-secondary text-xs"
                  >
                    Submit another response
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className="btn-tactile-primary text-xs"
                  >
                    View Community Reviews →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Rating Stars */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#1F2421] flex items-center justify-between">
                    <span>Overall Experience Rating:</span>
                    <span className="text-[#D95D39] font-bold">
                      {RATING_LABELS[hoverRating || rating]}
                    </span>
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-white border border-[#CFC5B4] shadow-tactile-card rounded-xl justify-center sm:justify-start">
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
                              ? "fill-[#D95D39] text-[#D95D39]"
                              : "text-[#CFC5B4]"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-sm font-bold text-[#1F2421] font-mono">
                      {hoverRating || rating} / 5
                    </span>
                  </div>
                </div>

                {/* Category Chips */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#1F2421]">
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
                            ? "btn-tactile-primary text-xs py-1.5 px-3"
                            : "bg-white border-[#CFC5B4] text-[#5A625E] hover:text-[#1F2421]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#1F2421]">
                    Your Comments & Suggestions *
                  </label>
                  <textarea
                    rows={4}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Tell us what you liked, how quick your item was matched, or what we can improve at the security counter..."
                    className="editorial-input resize-none"
                    required
                  />
                </div>

                {/* User Info (PRN and Name) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2421] flex items-center gap-1.5 mb-1">
                      <Hash className="h-3 w-3 text-[#5A625E]" />
                      <span>Student PRN (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={prnNumber}
                      onChange={(e) => setPrnNumber(e.target.value)}
                      placeholder="e.g. 1032210084"
                      className="editorial-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2421] flex items-center gap-1.5 mb-1">
                      <User className="h-3 w-3 text-[#5A625E]" />
                      <span>Full Name (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sandip Barela"
                      className="editorial-input text-xs"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl badge-alert text-xs flex items-center gap-2 border">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3DCD0]">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-tactile-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-tactile-primary text-xs py-2.5 px-5 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                <div className="p-4 rounded-xl bg-[#F2ECE1] border border-[#E3DCD0] shadow-tactile-card flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="font-serif text-3xl font-black text-[#D95D39]">
                      {stats.averageRating}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${
                              s <= Math.round(stats.averageRating)
                                ? "fill-[#D95D39] text-[#D95D39]"
                                : "text-[#CFC5B4]"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#5A625E] font-medium">
                        Based on {stats.totalFeedback} verified campus entries
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-[#1F2421] bg-white px-3 py-1.5 rounded-lg border border-[#CFC5B4] shadow-tactile-card">
                    ⭐ <strong>{stats.fiveStarCount}</strong> 5-star ratings recorded
                  </div>
                </div>
              )}

              {loadingReviews ? (
                <div className="py-12 text-center text-xs text-[#5A625E] font-mono">
                  Loading verified student reviews from MySQL...
                </div>
              ) : communityReviews.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#5A625E] font-mono">
                  No feedback records found yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {communityReviews.map((item: any) => (
                    <div
                      key={item.feedback_id}
                      className="p-3.5 rounded-xl border border-[#E3DCD0] bg-white shadow-tactile-card space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1F2421]">
                            {item.student_name || `Student (${item.prn_number || "Verified"})`}
                          </span>
                          <span className="badge-campus text-[10px] px-2 py-0.5 rounded-md font-mono">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${
                                s <= item.rating
                                  ? "fill-[#D95D39] text-[#D95D39]"
                                  : "text-[#CFC5B4]"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[#1F2421] text-xs leading-relaxed">
                        {item.comments}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-[#5A625E] font-mono pt-1">
                        <span>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}
                        </span>
                        {item.admin_notes && (
                          <span className="badge-verified px-2 py-0.5 rounded font-medium">
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
