"use client";

import { useState } from "react";
import { X, Lock, Mail, User, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
  onSuccess: (user: { name: string; prn: string }) => void;
}

export default function AuthModal({ isOpen, initialMode = "login", onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [name, setName] = useState("");
  const [prn, setPrn] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onSuccess({ name: name || "Student User", prn: prn || "1032210045" });
      onClose();
      setSubmitted(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 editorial-modal-backdrop animate-in fade-in duration-200">
      <div 
        className="editorial-modal-container max-w-md w-full p-6 sm:p-8 relative text-[#1F2421]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="btn-tactile-secondary absolute top-6 right-6 p-2 text-xs"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6">
          <div className="h-10 w-10 rounded-xl bg-[#F2ECE1] text-[#D95D39] border border-[#E3DCD0] flex items-center justify-center mb-3">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-tight text-[#1F2421]">
            {isLogin ? "Welcome Back" : "Student Registration"}
          </h3>
          <p className="text-xs text-[#5A625E] mt-1 font-sans">
            {isLogin 
              ? "Access the campus Lost & Found database with your student credentials."
              : "Register to submit reports and manage your verified claims."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#1F2421]">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-[#5A625E]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="editorial-input pl-10 pr-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#1F2421]">
              PRN Number / Campus ID
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-3 h-4 w-4 text-[#5A625E]" />
              <input
                type="text"
                required
                placeholder="e.g. 1032210045"
                value={prn}
                onChange={(e) => setPrn(e.target.value)}
                className="editorial-input pl-10 pr-3.5 py-2.5 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[#1F2421]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#5A625E]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="editorial-input pl-10 pr-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitted}
            className="btn-tactile-primary w-full mt-2 py-3 text-sm flex items-center justify-center gap-2"
          >
            {submitted ? "Authenticating..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#5A625E]">
          {isLogin ? "Don't have an account? " : "Already registered? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#D95D39] font-semibold hover:underline cursor-pointer"
          >
            {isLogin ? "Register here" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

