import { ClaimsPortal } from "@/components/claims-portal"
import { Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-50">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full px-6 py-8 sm:px-8 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-4 hover:opacity-80 transition-opacity"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">
                Rumsan Automations
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <section className="mx-auto max-w-480px-8 sm:px-10 lg:px-10">

        {/* Bigger Content Container */}
        <div className="w-full max-w-480px-8 rounded-3xl bg-slate-900/70 border border-slate-800 sm:p-20 lg:p-20 mx-auto">
      
          <h4 className="text-5xl sm:text-6xl font-bold mb-6 text-balance">
            Claims Portal
          </h4>
          <ClaimsPortal />
        </div>
      </section>





      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="mx-auto max-w-480px-8 sm:px-10 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Rumsan Automations
          </p>
          <p className="text-sm text-slate-500">
            Powered by automated workflows
          </p>
        </div>
      </footer>
    </main>
  )
}
