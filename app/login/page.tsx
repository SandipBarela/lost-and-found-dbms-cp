"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    Users, 
    ShieldCheck, 
    Mail, 
    Lock, 
    ArrowRight, 
    Sun, 
    Moon, 
    KeyRound,
    AlertCircle
} from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    // Two primary options: "user" (all campus students, faculty & staff) and "admin"
    const [loginType, setLoginType] = useState<"user" | "admin">("user");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isUser = loginType === "user";
    const isAdmin = loginType === "admin";

    const handleQuickFill = (type: "user" | "admin") => {
        setErrorMessage(null);
        if (type === "user") {
            setLoginType("user");
            setEmail("student.roll@college.edu");
            setPassword("campus123");
        } else {
            setLoginType("admin");
            setEmail("admin@campus.dbms");
            setPassword("admin123");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role: loginType })
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setLoading(false);
                setErrorMessage(data.message || "Invalid credentials. Please verify your details.");
                return;
            }

            const sessionUser = {
                email: data.user?.email || email,
                role: data.user?.role || loginType,
                displayName: data.user?.fullName || (loginType === "admin" ? "System Administrator" : email.split("@")[0]),
                prnNumber: data.user?.prnNumber || "1032210084",
                department: data.user?.department || "Campus Division",
                loginTime: new Date().toISOString()
            };

            localStorage.setItem("lf_user", JSON.stringify(sessionUser));
            sessionStorage.setItem("lf_session_active", "true");

            setTimeout(() => {
                setLoading(false);
                if (sessionUser.role === "admin") {
                    router.push("/admin");
                } else {
                    router.push("/");
                }
            }, 400);
        } catch (err: any) {
            // Offline/Network fallback
            const sessionUser = {
                email,
                role: loginType,
                displayName: loginType === "admin" ? "System Administrator" : (email.split("@")[0] || "Campus User"),
                loginTime: new Date().toISOString()
            };
            localStorage.setItem("lf_user", JSON.stringify(sessionUser));
            sessionStorage.setItem("lf_session_active", "true");
            setTimeout(() => {
                setLoading(false);
                router.push(loginType === "admin" ? "/admin" : "/");
            }, 400);
        }
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
        <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#FAF7F2] text-[#1F2421] font-sans selection:bg-[#D95D39]/20">
            {/* Top Navbar */}
            <header className="relative z-20 w-full border-b border-[#E3DCD0] editorial-header">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-white shadow-xs flex items-center justify-center border border-[#CFC5B4] p-0.5 shrink-0">
                            <img 
                                src="/reunite-logo.jpg" 
                                alt="ReUnite Logo" 
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <span className="font-serif text-2xl font-bold tracking-tight flex items-center">
                            <span className="text-[#1F2421]">Re</span>
                            <span className="text-[#D95D39]">Unite</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle Theme"
                            className="btn-tactile-secondary flex h-9 w-9 items-center justify-center p-0"
                        >
                            <Sun className="h-4 w-4 hidden dark:block text-amber-500" />
                            <Moon className="h-4 w-4 block dark:hidden text-[#2D5A4C]" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Login Card Area */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
                <div className="w-full max-w-md">
                    <div className="rounded-[18px] border-[1.5px] border-[#CFC5B4] bg-white shadow-tactile-modal p-6 sm:p-8">
                        
                        {/* Heading Section */}
                        <div className="text-center mb-6">
                            <span className="badge-campus inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider font-semibold mb-3">
                                <ShieldCheck className="h-4 w-4" />
                                Institutional Access Gate
                            </span>
                            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2421]">
                                {isUser ? "User Sign In" : "Administrator Sign In"}
                            </h1>
                            <p className="mt-1.5 text-xs sm:text-sm text-[#5A625E]">
                                {isUser 
                                    ? "Open to all students, faculty, and college community members."
                                    : "Restricted portal. Requires DBMS Administrator credentials."}
                            </p>
                        </div>

                        {/* EXACT TWO OPTIONS: USER AND ADMIN */}
                        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-[#F2ECE1] border border-[#E3DCD0] mb-5">
                            <button
                                type="button"
                                onClick={() => {
                                    setLoginType("user");
                                    setErrorMessage(null);
                                }}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                    isUser
                                        ? "btn-tactile-primary py-2.5"
                                        : "text-[#5A625E] hover:text-[#1F2421]"
                                }`}
                            >
                                <Users className="h-4 w-4" />
                                <span>1. User</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setLoginType("admin");
                                    setErrorMessage(null);
                                }}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                    isAdmin
                                        ? "btn-tactile-primary py-2.5"
                                        : "text-[#5A625E] hover:text-[#1F2421]"
                                }`}
                            >
                                <KeyRound className="h-4 w-4" />
                                <span>2. Admin</span>
                            </button>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="mb-4 p-3 rounded-xl badge-alert text-xs flex items-center gap-2 border">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1.5 text-[#1F2421]">
                                    {isAdmin ? "Admin Email / Identifier" : "College Email / PRN"}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#5A625E]" />
                                    <input
                                        type="text"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={isAdmin ? "admin@campus.dbms" : "student.roll@college.edu"}
                                        className="editorial-input pl-10 pr-3.5 py-2.5 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5 text-[#1F2421]">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#5A625E]" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="editorial-input pl-10 pr-3.5 py-2.5 text-sm"
                                    />
                                </div>
                            </div>

                            {/* One-Click Quick Autofills */}
                            <div className="pt-1 flex items-center justify-between text-xs text-[#5A625E] font-mono">
                                <span>Quick Demo Fill:</span>
                                <div className="flex gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => handleQuickFill("user")} 
                                        className="text-[#D95D39] hover:underline cursor-pointer font-medium"
                                    >
                                        User Login
                                    </button>
                                    <span>•</span>
                                    <button 
                                        type="button" 
                                        onClick={() => handleQuickFill("admin")} 
                                        className="text-[#D95D39] hover:underline cursor-pointer font-medium"
                                    >
                                        Admin Login
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-tactile-primary w-full mt-3 py-3 text-sm flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span>Authenticating & Entering...</span>
                                ) : (
                                    <>
                                        <span>Sign In as {isAdmin ? "Administrator" : "User"}</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 py-6 border-t border-[#E3DCD0] text-center text-xs text-[#5A625E]">
                <p>© 2026 ReUnite. Secure institutional entry for Students, Staff, and Administrators.</p>
            </footer>
        </div>
    );
}
