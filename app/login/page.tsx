"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Briefcase, Mail, Lock, ArrowRight, ShieldCheck, Sun, Moon } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState<"student" | "teacher">("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const isStudent = role === "student";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Store authenticated session
        const sessionUser = {
            email,
            role,
            displayName: email.split("@")[0],
            loginTime: new Date().toISOString()
        };
        localStorage.setItem("lf_user", JSON.stringify(sessionUser));

        setTimeout(() => {
            setLoading(false);
            // Redirect straight to the main page!
            router.push("/");
        }, 800);
    };

    const toggleTheme = () => {
        if (document.documentElement.classList.contains("dark")) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300 font-sans selection:bg-indigo-500/20">
            {/* Ambient Background Grid & Glow (Identical to 3D Hero & Main Portal) */}
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] opacity-70 dark:opacity-65" />
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),transparent)] dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18)_0%,transparent_75%)]" />

            {/* Top Minimal Navigation */}
            <header className="relative z-20 w-full border-b border-neutral-200/80 dark:border-white/10 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-mono text-base font-bold shadow-lg shadow-indigo-500/20">
                            LF
                        </div>
                        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
                            Lost & Found
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle Theme"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                        >
                            <Sun className="h-4 w-4 hidden dark:block text-amber-400" />
                            <Moon className="h-4 w-4 block dark:hidden text-indigo-600" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Login Card Area */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
                <div className="w-full max-w-md">
                    <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
                        <div className="text-center mb-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Institutional Access Portal
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                {isStudent ? "Student Login" : "Faculty & Staff Login"}
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                                {isStudent 
                                    ? "Sign in with your student credentials to enter the Lost & Found portal."
                                    : "Sign in with your staff credentials to enter the Lost & Found portal."}
                            </p>
                        </div>

                        {/* Dual Role Toggle Button (Student vs Teacher) */}
                        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-white/10 mb-6">
                            <button
                                type="button"
                                onClick={() => setRole("student")}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                    isStudent
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                }`}
                            >
                                <GraduationCap className="h-4 w-4" />
                                <span>Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("teacher")}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                    !isStudent
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                }`}
                            >
                                <Briefcase className="h-4 w-4" />
                                <span>Teacher</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1.5 text-neutral-700 dark:text-neutral-300">
                                    {isStudent ? "Student College Email" : "Faculty / Staff Email"}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={isStudent ? "student.roll@college.edu" : "faculty.name@college.edu"}
                                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5 text-neutral-700 dark:text-neutral-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center text-xs pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-neutral-600 dark:text-neutral-400">
                                    <input 
                                        type="checkbox" 
                                        defaultChecked
                                        className="rounded border-neutral-300 dark:border-neutral-700 text-indigo-600 focus:ring-indigo-500" 
                                    />
                                    <span>Remember this device</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                            >
                                {loading ? (
                                    <span>Verifying Credentials & Entering...</span>
                                ) : (
                                    <>
                                        <span>Sign In as {isStudent ? "Student" : "Teacher"}</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 py-6 border-t border-neutral-200 dark:border-white/10 text-center text-xs text-neutral-500">
                <p>© 2026 Lost & Found DBMS. Secured with institutional credentials.</p>
            </footer>
        </div>
    );
}
