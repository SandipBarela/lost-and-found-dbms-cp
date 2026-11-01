"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PerspectiveTunnelHero from "@/components/ui/perspective-tunnel-hero";
import LandingContent from "@/components/landing-content";
import GlobalNavbar from "@/components/global-navbar";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("lf_user");
    if (!user) {
      // If not logged in, redirect straight to the login page
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // While checking authentication, show a clean themed loading placeholder
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-neutral-950 text-neutral-900 dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white font-mono font-bold flex items-center justify-center animate-pulse">
            LF
          </div>
          <p className="text-xs font-mono text-neutral-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col bg-white dark:bg-neutral-950 transition-colors duration-300">
      {/* Navbar fixed permanently at the very top throughout animation and main page */}
      <GlobalNavbar />

      {/* 3D Perspective Tunnel Hero */}
      <section id="hero-3d" className="relative w-full h-[100svh]">
        <PerspectiveTunnelHero />
      </section>

      {/* Main Portal Content Sections */}
      <section id="main-portal" className="w-full relative z-20">
        <LandingContent />
      </section>
    </main>
  );
}
