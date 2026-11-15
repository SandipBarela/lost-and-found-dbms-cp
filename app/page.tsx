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
    // Check if user has an active session for this visit
    const sessionActive = sessionStorage.getItem("lf_session_active");
    const user = localStorage.getItem("lf_user");
    
    // If not logged in in this session, always redirect to login page first!
    if (!sessionActive || !user) {
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // While checking authentication, show clean branded loading screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF7F2] text-[#1F2421]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-[#D95D39] text-white font-mono font-bold flex items-center justify-center animate-pulse shadow-tactile-btn">
            LF
          </div>
          <p className="text-sm font-bold text-[#1F2421] font-sans">Checking credentials & entering portal...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col bg-[#FAF7F2] text-[#1F2421]">
      {/* Navbar fixed permanently at the top */}
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
