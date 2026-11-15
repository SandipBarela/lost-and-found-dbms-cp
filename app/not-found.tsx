import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF7F2] text-[#1F2421] text-center font-sans">
      <div className="h-12 w-12 rounded-xl overflow-hidden bg-white shadow-xs p-1 border border-[#CFC5B4] mb-4">
        <img src="/reunite-logo.jpg" alt="ReUnite" className="h-full w-full object-contain" />
      </div>
      <h2 className="font-serif text-5xl font-bold mb-2 text-[#1F2421]">404</h2>
      <p className="text-sm text-[#5A625E] mb-6">Page not found in ReUnite.</p>
      <Link 
        href="/" 
        className="btn-tactile-primary text-xs py-2.5 px-5"
      >
        Return to Home
      </Link>
    </div>
  );
}
