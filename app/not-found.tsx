import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-center">
      <div className="h-12 w-12 rounded-xl overflow-hidden bg-white shadow-sm p-1 border border-neutral-200 dark:border-white/10 mb-4">
        <img src="/reunite-logo.jpg" alt="ReUnite" className="h-full w-full object-contain" />
      </div>
      <h2 className="text-4xl font-extrabold mb-2 font-mono">404</h2>
      <p className="text-sm text-neutral-500 mb-6">Page not found in ReUnite.</p>
      <Link 
        href="/" 
        className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
