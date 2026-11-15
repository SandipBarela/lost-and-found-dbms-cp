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
  locationId?: number | null;
  dateTime: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  image: string;
}

interface CampusLocation {
  location_id: number;
  building_name: string;
  floor_room: string;
  campus_zone: string;
  full_display_name?: string;
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
  const [campusLocations, setCampusLocations] = useState<CampusLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
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

  // Fetch campus locations from MySQL location master table
  useEffect(() => {
    if (isOpen) {
      fetch("/api/locations")
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.locations)) {
            setCampusLocations(data.locations);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

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
    setSelectedLocationId(null);
    setErrors({});
  };

  const handleLocationChange = (val: string) => {
    setFormData(prev => ({ ...prev, location: val }));
    if (errors.location) setErrors(prev => ({ ...prev, location: "" }));

    const trimmed = val.trim();
    const matched = campusLocations.find(loc => 
      loc.full_display_name === trimmed || 
      `${loc.building_name} - ${loc.floor_room} (${loc.campus_zone})` === trimmed ||
      `${loc.building_name} - ${loc.floor_room}` === trimmed ||
      loc.building_name.toLowerCase() === trimmed.toLowerCase()
    );
    setSelectedLocationId(matched ? matched.location_id : null);
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
      locationId: selectedLocationId,
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 editorial-modal-backdrop animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto editorial-modal-container p-6 sm:p-8 text-[#1F2421]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-6 right-6 p-2 rounded-xl text-[#5A625E] hover:text-[#1F2421] hover:bg-[#F2ECE1] transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-16 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 rounded-full bg-[#E1EFE9] text-[#225444] border border-[#BFD9CE] flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-2 text-[#1F2421]">Report Successfully Submitted!</h3>
            <p className="text-sm text-[#5A625E] max-w-md">
              Your {type} item has been recorded in the database under your authenticated credentials.
            </p>
            <span className="mt-4 text-xs font-mono text-[#225444]">
              Closing dialogue...
            </span>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold mb-2 ${
                isLost ? "badge-alert" : "badge-verified"
              }`}>
                {isLost ? "Missing Property Report" : "Found Property Claim Registry"}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-[-0.025em] text-[#1F2421]">
                {isLost ? "Report a Lost Item" : "Report a Found Item"}
              </h2>
              <p className="text-xs text-[#5A625E] mt-1 font-sans">
                Enter only the item details, location, and photo. Your credentials are automatically linked from your login.
              </p>
            </div>

            {/* Authenticated User Auto-Link Card */}
            <div className="mb-6 p-3.5 rounded-xl bg-white border border-[#E3DCD0] shadow-tactile-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#2D5A4C] text-[#E1EFE9] flex items-center justify-center font-bold font-mono text-sm shadow-xs">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-[#1F2421]">
                      {currentUser.displayName || "Logged In User"}
                    </span>
                    <span className="text-[10px] font-mono badge-verified px-2 py-0.5 font-bold">
                      Linked
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A625E] font-mono">
                    PRN: {currentUser.prnNumber || "1032210084"} • {currentUser.department || "Campus Division"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#5A625E] hidden sm:inline">
                Auto-filled from DB
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* SECTION 1: ITEM INFORMATION & LOCATION */}
              <div className="space-y-4">
                <div className="border-b border-[#E3DCD0] pb-1 flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#D95D39] font-bold">
                    1. Item Information & Location
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1.5 text-[#1F2421]">
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
                      className={`w-full px-3.5 py-2.5 editorial-input text-sm ${
                        errors.itemTitle ? "border-[#A83C1D] ring-1 ring-[#A83C1D]" : ""
                      }`}
                    />
                    {errors.itemTitle && (
                      <p className="text-[11px] text-[#A83C1D] mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.itemTitle}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#1F2421]">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 editorial-input text-sm cursor-pointer"
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
                    <label className="block text-xs font-semibold mb-1.5 text-[#1F2421]">
                      {isLost ? "Last Seen Location *" : "Found Location *"}
                    </label>
                    <input
                      type="text"
                      required
                      list="location-options"
                      placeholder="e.g. Library - Floor 2, Room 101 or type custom room"
                      value={formData.location}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      className={`w-full px-3.5 py-2.5 editorial-input text-sm ${
                        errors.location ? "border-[#A83C1D] ring-1 ring-[#A83C1D]" : ""
                      }`}
                    />
                    <datalist id="location-options">
                      {campusLocations.map((loc) => (
                        <option 
                          key={loc.location_id} 
                          value={loc.full_display_name || `${loc.building_name} - ${loc.floor_room} (${loc.campus_zone})`} 
                        />
                      ))}
                    </datalist>
                    {errors.location && (
                      <p className="text-[11px] text-[#A83C1D] mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#1F2421]">
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.dateTime}
                      onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 editorial-input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#1F2421]">
                    Distinguishing Marks & Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Color, brand, unique scratches, stickers, or specific contents to help identification."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 editorial-input text-sm resize-none"
                  />
                </div>
              </div>

              {/* SECTION 2: INSERT ITEM IMAGE */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#D95D39] font-bold border-b border-[#E3DCD0] pb-1">
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
                  className="editorial-dropzone p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
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
                      <div className="h-10 w-10 rounded-full bg-[#EFE6D8] text-[#7C4A2D] flex items-center justify-center">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="text-xs text-[#5A625E]">
                        <span className="font-semibold text-[#D95D39]">Click to upload item photo</span> or drag and drop
                      </div>
                      <span className="text-[10px] text-[#5A625E] font-mono">PNG, JPG, WEBP (Saved directly to MySQL BLOB)</span>
                    </>
                  )}
                </div>
                {errors.image && (
                  <p className="text-[11px] text-[#A83C1D] mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {errors.image}
                  </p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#E3DCD0]">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#5A625E] hover:text-[#1F2421] text-xs font-medium transition-all cursor-pointer"
                  title="Clear all fields"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-tactile-secondary px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-tactile-primary px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold cursor-pointer"
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
