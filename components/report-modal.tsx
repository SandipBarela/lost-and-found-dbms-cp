"use client";

import { useState, useRef } from "react";
import { X, Upload, CheckCircle, AlertTriangle, RotateCcw } from "lucide-react";

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
  name: "",
  prnNumber: "",
  rollNumber: "",
  division: "",
  itemTitle: "",
  category: "Electronics",
  location: "",
  dateTime: new Date().toISOString().slice(0, 16),
  description: "",
  contactEmail: "",
  contactPhone: "",
  image: "",
};

export default function ReportModal({ isOpen, type, onClose, onSubmit }: ReportModalProps) {
  const [formData, setFormData] = useState<Omit<ItemFormData, "type">>(INITIAL_FORM_STATE);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Rule 5: Prevent Errors - Validate input constraints before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    if (!formData.prnNumber.trim()) {
      newErrors.prnNumber = "PRN number is required.";
    } else if (!/^\d{8,12}$/.test(formData.prnNumber.trim())) {
      newErrors.prnNumber = "PRN must be 8 to 12 digits numeric.";
    }
    if (!formData.rollNumber.trim()) newErrors.rollNumber = "Roll number is required.";
    if (!formData.division.trim()) newErrors.division = "Division/Department is required.";
    if (!formData.itemTitle.trim()) newErrors.itemTitle = "Item title is required.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";
    return newErrors;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image size must be under 5MB." }));
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

  // Rule 6: Permit Easy Reversal of Actions - Reset form button
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

    const fullData: ItemFormData = {
      ...formData,
      type,
      image: finalImage,
    };

    onSubmit(fullData);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      handleReset();
      onClose();
    }, 2000);
  };

  const isLost = type === "lost";

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose} /* Rule 7: User Control - dismiss by clicking outside */
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xl p-6 sm:p-8 text-neutral-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Rule 7: User in Control - Close button */}
        <button
          onClick={onClose}
          aria-label="Close report dialogue"
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Rule 3: Informative Feedback & Rule 4: Dialogue Closure */}
        {isSuccess ? (
          <div className="py-16 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Report Successfully Submitted!</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
              Task completed. Your {type} report is now indexed in the DBMS registry and available on the live feed.
            </p>
            <span className="mt-4 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              Dialogue closing automatically...
            </span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold mb-2 ${
                isLost ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              }`}>
                {isLost ? "Missing Property Report" : "Found Property Claim Registry"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {isLost ? "Report a Lost Item" : "Report a Found Item"}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Fill in the details below. Required fields are marked with an asterisk (*).
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STUDENT CREDENTIALS SECTION */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold border-b border-neutral-200 dark:border-white/10 pb-1">
                  1. Student Verification Credentials
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.name ? "border-rose-500 focus:ring-rose-500/50" : "border-neutral-200 dark:border-white/10 focus:ring-indigo-500/50"} bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2`}
                    />
                    {errors.name && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                      PRN Number * (8-12 digits)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1032210045"
                      value={formData.prnNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, prnNumber: e.target.value });
                        if (errors.prnNumber) setErrors(prev => ({ ...prev, prnNumber: "" }));
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.prnNumber ? "border-rose-500 focus:ring-rose-500/50" : "border-neutral-200 dark:border-white/10 focus:ring-indigo-500/50"} bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 font-mono`}
                    />
                    {errors.prnNumber && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {errors.prnNumber}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TY-CS-42"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div>
                    {/* Rule 8: Reduce Memory Load - Suggested list for Division */}
                    <label className="block text-xs font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                      Division / Department *
                    </label>
                    <input
                      type="text"
                      required
                      list="division-options"
                      placeholder="e.g. Div A - Computer Engineering"
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <datalist id="division-options">
                      <option value="Div A - Computer Engineering" />
                      <option value="Div B - Information Technology" />
                      <option value="Div C - Mechanical Engineering" />
                      <option value="Div D - Civil Engineering" />
                      <option value="Div E - Electrical Engineering" />
                    </datalist>
                  </div>
                </div>
              </div>

              {/* ITEM SPECIFICATION SECTION */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold border-b border-neutral-200 dark:border-white/10 pb-1">
                  2. Item Information & Location
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                      Item Name / Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Casio Scientific Calculator FX-991EX"
                      value={formData.itemTitle}
                      onChange={(e) => setFormData({ ...formData, itemTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div>
                    {/* Rule 8: Reduce Memory Load - predefined Category Dropdown */}
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
                      <option value="Bags & Backpacks">Bags & Backpacks</option>
                      <option value="Stationery & Books">Stationery & Books</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    {/* Rule 8: Reduce Memory Load - Suggested locations */}
                    <label className="block text-xs font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                      {isLost ? "Last Seen Location *" : "Found Location *"}
                    </label>
                    <input
                      type="text"
                      required
                      list="location-options"
                      placeholder="e.g. Central Library, 2nd Floor"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <datalist id="location-options">
                      <option value="Central Library (2nd Floor)" />
                      <option value="Student Center Cafeteria" />
                      <option value="Engineering Hall B-104" />
                      <option value="North Parking Lot" />
                      <option value="Sports Complex / Ground" />
                      <option value="Main Auditorium" />
                    </datalist>
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
                    placeholder="Include color, brand, scratches, stickers, or specific contents to help identification."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  />
                </div>
              </div>

              {/* IMAGE UPLOAD SECTION */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold border-b border-neutral-200 dark:border-white/10 pb-1">
                  3. Insert Item Image
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
                    <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black/40">
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
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload image</span> or drag and drop
                      </div>
                      <span className="text-[10px] text-neutral-400">PNG, JPG, WEBP up to 5MB</span>
                    </>
                  )}
                </div>
                {errors.image && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {errors.image}</p>}
              </div>

              {/* SUBMIT, RESET & CANCEL BUTTONS */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 dark:border-white/10">
                {/* Rule 6: Permit Easy Reversal of Actions (Reset) */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs font-medium transition-all"
                  title="Clear all fields"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Form</span>
                </button>

                <div className="flex items-center gap-3">
                  {/* Rule 7: Keep User in Control (Cancel) */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-sm font-medium transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  {/* Rule 1: Consistency (Primary CTA styling) */}
                  <button
                    type="submit"
                    className={`px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all cursor-pointer ${
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
