import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { Briefcase, Upload, Sparkles } from 'lucide-react'
import { useHR } from '../context/HRContext'
import AssistantChat from './AssistantChat'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/candidates', label: 'Candidates & Scoring' },
  { to: '/pipeline', label: 'Interview Pipeline' },
  { to: '/jobs', label: 'Job Openings' },
  { to: '/offers', label: 'Offers' },
]

export default function Layout() {
  const { toast, stats } = useHR()
  const [assistantOpen, setAssistantOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                <Briefcase className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">TalentPulse ATS</h1>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                AI-Powered
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Intelligent Candidate Sourcing & Pipeline Management
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Upload className="h-4 w-4" />
              Upload & Parse Resume
            </Link>
            <button
              type="button"
              onClick={() => setAssistantOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              <Sparkles className="h-4 w-4" />
              AI Assistant
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition',
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <p className="hidden pb-1 text-xs text-slate-500 sm:block">
            Active Job: <span className="font-medium text-slate-700">{stats.openJobs} open positions</span>
            <span className="mx-1.5 text-slate-300">|</span>
            Total Candidates: <span className="font-medium text-slate-700">{stats.totalCandidates}</span>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {toast && (
        <div className="fixed right-4 bottom-4 z-50 max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-lg">
          {toast.message}
        </div>
      )}

      <AssistantChat open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  )
}
