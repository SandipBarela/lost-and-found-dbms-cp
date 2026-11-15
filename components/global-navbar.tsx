"use client";

import { useState, useEffect } from "react";
import { LogIn, Sun, Moon, Bell } from "lucide-react";
import NotificationsModal from "./notifications-modal";

export default function GlobalNavbar() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [currentUser, setCurrentUser] = useState<{ email: string; role: string; displayName: string; prnNumber?: string } | null>(null);
    const [notifModalOpen, setNotifModalOpen] = useState(false);

    useEffect(() => {
        // Theme initialization
        const saved = localStorage.getItem("theme") as "light" | "dark" | null;
        if (saved) {
            setTheme(saved);
            if (saved === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        } else {
            setTheme("light");
            document.documentElement.classList.remove("dark");
        }

        // User session check
        const storedUser = localStorage.getItem("lf_user");
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const toggleTheme = () => {
        if (theme === "dark") {
            setTheme("light");
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        } else {
            setTheme("dark");
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("lf_user");
        sessionStorage.removeItem("lf_session_active");
        window.location.href = "/login";
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full editorial-header transition-all">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <a href="#hero-3d" className="flex items-center gap-2.5 group">
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-white shadow-tactile-card flex items-center justify-center border border-[#CFC5B4] group-hover:scale-105 transition-transform p-0.5 shrink-0">
                        <img 
                            src="/reunite-logo.jpg" 
                            alt="ReUnite Logo" 
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <span className="font-serif text-2xl font-bold tracking-[-0.025em] flex items-center">
                        <span className="text-[#1F2421]">Re</span>
                        <span className="text-[#D95D39]">Unite</span>
                    </span>
                </a>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1F2421]/80">
                    <a href="#hero" className="hover:text-[#D95D39] transition-colors">Home</a>
                    <a href="#how-it-works" className="hover:text-[#D95D39] transition-colors">How It Works</a>
                    <a href="#recent" className="hover:text-[#D95D39] transition-colors">Recent Items</a>
                    <a href="#about" className="hover:text-[#D95D39] transition-colors">About</a>
                    {currentUser?.role === "admin" && (
                        <a href="/admin" className="px-3 py-1 rounded-full badge-alert text-xs font-mono font-medium hover:opacity-90 transition-opacity">
                            🛡️ Admin Console
                        </a>
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    {/* Instant Notifications Bell */}
                    <button
                        onClick={() => setNotifModalOpen(true)}
                        aria-label="View Notifications"
                        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#CFC5B4] bg-white text-[#1F2421] shadow-tactile-card hover:bg-[#F2ECE1] transition-all cursor-pointer active:translate-y-0.5"
                    >
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#D95D39]" />
                    </button>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#CFC5B4] bg-white text-[#1F2421] shadow-tactile-card hover:bg-[#F2ECE1] transition-all cursor-pointer active:translate-y-0.5"
                    >
                        {theme === "dark" ? (
                            <Sun className="h-4 w-4 text-[#D95D39]" />
                        ) : (
                            <Moon className="h-4 w-4 text-[#2D5A4C]" />
                        )}
                    </button>

                    {currentUser ? (
                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline-block text-xs font-mono text-[#1F2421] bg-[#F2ECE1] px-2.5 py-1.5 rounded-lg border border-[#CFC5B4]">
                                {currentUser.role === "admin" 
                                    ? "🛡️ Admin" 
                                    : "👤 User"}: {currentUser.displayName}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="btn-tactile-secondary text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5"
                            >
                                <LogIn className="h-3.5 w-3.5 rotate-180" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <a 
                            href="/login"
                            className="btn-tactile-primary px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer flex items-center gap-2"
                        >
                            <LogIn className="h-4 w-4" />
                            <span>Sign In</span>
                        </a>
                    )}
                </div>
            </div>

            {/* NOTIFICATIONS MODAL FROM NAVBAR */}
            <NotificationsModal
                isOpen={notifModalOpen}
                onClose={() => setNotifModalOpen(false)}
            />
        </header>
    );
}
