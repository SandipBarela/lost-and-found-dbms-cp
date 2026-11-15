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
        <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-neutral-200/80 dark:border-white/10 bg-white/75 dark:bg-neutral-950/75 backdrop-blur-md transition-all">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <a href="#hero-3d" className="flex items-center gap-2.5 group">
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center border border-neutral-200 dark:border-white/10 group-hover:scale-105 transition-transform p-0.5 shrink-0">
                        <img 
                            src="/reunite-logo.jpg" 
                            alt="ReUnite Logo" 
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <span className="text-2xl font-black tracking-tight flex items-center">
                        <span className="text-[#0f294a] dark:text-[#93c5fd]">Re</span>
                        <span className="text-[#ea580c] dark:text-[#fb923c]">Unite</span>
                    </span>
                </a>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    <a href="#hero" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Home</a>
                    <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-white transition-colors">How It Works</a>
                    <a href="#recent" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Recent Items</a>
                    <a href="#about" className="hover:text-indigo-600 dark:hover:text-white transition-colors">About</a>
                    {currentUser?.role === "admin" && (
                        <a href="/admin" className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-medium hover:bg-purple-500/20 transition-colors">
                            🛡️ Admin Console
                        </a>
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    {/* Instant Notifications Bell */}
                    <button
                        onClick={() => setNotifModalOpen(true)}
                        aria-label="View Notifications"
                        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    </button>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                    >
                        {theme === "dark" ? (
                            <Sun className="h-4 w-4 text-amber-400" />
                        ) : (
                            <Moon className="h-4 w-4 text-indigo-600" />
                        )}
                    </button>

                    {currentUser ? (
                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline-block text-xs font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10">
                                {currentUser.role === "admin" 
                                    ? "🛡️ Admin" 
                                    : "👤 User"}: {currentUser.displayName}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 hover:border-transparent text-xs font-semibold px-3 py-1.5 transition-all cursor-pointer"
                            >
                                <LogIn className="h-3.5 w-3.5 rotate-180" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <a 
                            href="/login"
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
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
