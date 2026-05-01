import { ClaimsPortal } from "@/components/invoice-validation";
import { Zap,ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600">
                Rumsan Automations
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-6 mt-6">
        {/* Back Arrow */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group mb-4"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm">Back to Home</span>
        </Link>
        
        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Invoice Validation Portal
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Submit and track your product warranty claims or report issues in a few simple steps
          </p>
        </div>
        
        {/* Claims Portal Component */}
        <ClaimsPortal />
      </section>
    </main>
  );
}
