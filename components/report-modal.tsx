"use client";

import { useState, useRef, useEffect } from "react";
import { 
  X, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw, 
  Sparkles,
  UserCheck,
  MapPin,
  Calendar,
  Tag,
  FileText
} from "lucide-react";

export interface ItemFormData {
  type: "lost" | "found";
  name: string;
  prnNumber: string;
  rollNumber: string;
  division: string;
  itemTitle: string;
  category: string;
  location: string;
  dateTime: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  image: string;
}

interface ReportModalProps {
  isOpen: boolean;
  type: "lost" | "found";
  onClose: () => void;
  onSubmit: (data: ItemFormData) => void;
}

const INITIAL_FORM_STATE = {
  itemTitle: "",
  category: "Electronics",
  location: "",
  dateTime: new Date().toISOString().slice(0, 16),
  description: "",
  image: "",
};

export default function ReportModal({ isOpen, type, onClose, onSubmit }: ReportModalProps) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-populated credentials from authenticated user profile / database
  const [currentUser, setCurrentUser] = useState<{
    displayName?: string;
    prnNumber?: string;
    department?: string;
    email?: string;
    rollNumber?: string;
  }>({
    displayName: "Sandip Barela",
    prnNumber: "1032210084",
    department: "Div A - Computer Engineering",
    email: "student@college.edu",
    rollNumber: "TY-CS-42"
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lf_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser({
          displayName: parsed.displayName || parsed.fullName || "Sandip Barela",
          prnNumber: parsed.prnNumber || "1032210084",
          department: parsed.department || "Div A - Computer Engineering",
          email: parsed.email || "student@college.edu",
          rollNumber: parsed.rollNumber || "TY-CS-42"
        });
      }
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  // Validate only item-specific information since credentials are auto-linked
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.itemTitle.trim()) {
      newErrors.itemTitle = "Item title is required.";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required.";
    }
    return newErrors;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image size must be under 8MB." }));
        return;
      }
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.image;
        return copy;
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setPreviewImage("");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const finalImage = previewImage || (
      type === "lost" 
        ? "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80"
        : "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"
    );

    // Auto-bundle item data with the logged-in user's database credentials
    const fullData: ItemFormData = {
      type,
      name: currentUser.displayName || "Sandip Barela",
      prnNumber: currentUser.prnNumber || "1032210084",
      rollNumber: currentUser.rollNumber || "TY-CS-42",
      division: currentUser.department || "Div A - Computer Engineering",
      contactEmail: currentUser.email || "student@college.edu",
      contactPhone: "+91 9810000020",
      itemTitle: formData.itemTitle,
      category: formData.category,
      location: formData.location,
      dateTime: formData.dateTime,
      description: formData.description,
      image: finalImage,
    };

    onSubmit(fullData);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      handleReset();
      onClose();
    }, 1800);
  };

  const isLost = type === "lost";

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xl p-6 sm:p-8 text-neutral-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-16 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Report Successfully Submitted!</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
              Your {type} item has been recorded in the database under your authenticated credentials.
            </p>
            <span className="mt-4 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              Closing dialogue...
            </span>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold mb-2 ${
                isLost ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              }`}>
                {isLost ? "Missing Property Report" : "Found Property Claim Registry"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {isLost ? "Report a Lost Item" : "Report a Found Item"}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Enter only the item details, location, and photo. Your credentials are automatically linked from your login.
              </p>
            </div>

            {/* Authenticated User Auto-Link Card */}
            <div className="mb-6 p-3.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800/60 border border-neutral-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold font-mono text-sm shadow-sm">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                      {currentUser.displayName || "Logged In User"}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-0.2 rounded-md font-bold">
                      Linked
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    PRN: {currentUser.prnNumber || "1032210084"} • {currentUser.department || "Campus Division"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                Auto-filled from DB
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* SECTION 1: ITEM INFORMATION & LOCATION */}
              <div className="space-y-4">
                <div className="border-b border-neutral-200 dark:border-white/10 pb-1 flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
                    1. Item Information & Location
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                      Item Name / Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HP Victus Laptop, Casio Calculator FX-991EX"
                      value={formData.itemTitle}
                      onChange={(e) => {
                        setFormData({ ...formData, itemTitle: e.target.value });
                        if (errors.itemTitle) setErrors(prev => ({ ...prev, itemTitle: "" }));
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        errors.itemTitle ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-200 dark:border-white/10"
                      } bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    />
                    {errors.itemTitle && (
                      <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.itemTitle}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Laptops & Accessories">Laptops & Accessories</option>
                      <option value="ID Cards & Wallets">ID Cards & Wallets</option>
                      <option value="Keys & Badges">Keys & Badges</option>
                      <option value="Clothing & Bags">Clothing & Bags</option>
                      <option value="Books & Stationery">Books & Stationery</option>
                      <option value="Jewelry & Watches">Jewelry & Watches</option>
                      <option value="Eyewear">Eyewear</option>
                      <option value="Sports Gear">Sports Gear</option>
                      <option value="Lab Equipment">Lab Equipment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                      {isLost ? "Last Seen Location *" : "Found Location *"}
                    </label>
                    <input
                      type="text"
                      required
                      list="location-options"
                      placeholder="e.g. Central Library 2nd Floor, Room 1001"
                      value={formData.location}
                      onChange={(e) => {
                        setFormData({ ...formData, location: e.target.value });
                        if (errors.location) setErrors(prev => ({ ...prev, location: "" }));
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        errors.location ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-200 dark:border-white/10"
                      } bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    />
                    <datalist id="location-options">
                      <option value="Central Library (2nd Floor)" />
                      <option value="Student Center Cafeteria" />
                      <option value="Engineering Hall B-104" />
                      <option value="Room 1001" />
                      <option value="North Parking Lot" />
                      <option value="Sports Complex / Ground" />
                      <option value="Main Auditorium" />
                      <option value="Science Block C Ground" />
                      <option value="Computer Center Lab 3" />
                    </datalist>
                    {errors.location && (
                      <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.dateTime}
                      onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                    Distinguishing Marks & Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Color, brand, unique scratches, stickers, or specific contents to help identification."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  />
                </div>
              </div>

              {/* SECTION 2: INSERT ITEM IMAGE */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold border-b border-neutral-200 dark:border-white/10 pb-1">
                  2. Insert Item Image
                </h4>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer transition-all bg-neutral-50/50 dark:bg-neutral-800/30 flex flex-col items-center justify-center gap-2"
                >
                  {previewImage ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-black/40">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-medium">
                        Click to change image
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload item photo</span> or drag and drop
                      </div>
                      <span className="text-[10px] text-neutral-400">PNG, JPG, WEBP (Saved directly to MySQL BLOB)</span>
                    </>
                  )}
                </div>
                {errors.image && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {errors.image}
                  </p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs font-medium transition-all cursor-pointer"
                  title="Clear all fields"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-xs sm:text-sm font-medium transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-lg transition-all cursor-pointer ${
                      isLost 
                        ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30" 
                        : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                    }`}
                  >
                    {isLost ? "Submit Lost Report" : "Register Found Item"}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
