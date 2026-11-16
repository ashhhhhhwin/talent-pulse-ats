import { Link } from 'react-router-dom'
import {
  Users,
  Briefcase,
  Target,
  Clock3,
  CloudUpload,
  Plus,
  ChevronRight,
} from 'lucide-react'
import { useHR } from '../context/HRContext'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function statusMeta(candidate) {
  const stage = candidate.pipelineStage
  if (stage === 'hired') return { label: 'Hired', className: 'bg-emerald-50 text-emerald-700' }
  if (stage === 'offer') return { label: 'Offer', className: 'bg-violet-50 text-violet-700' }
  if (stage === 'screening') return { label: 'Screening', className: 'bg-sky-50 text-sky-700' }
  if (['technical', 'manager', 'hr'].includes(stage)) {
    return { label: 'Interview', className: 'bg-orange-50 text-orange-700' }
  }
  return { label: 'Applied', className: 'bg-slate-100 text-slate-600' }
}

const avatarTones = [
  'bg-indigo-100 text-indigo-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-amber-100 text-amber-700',
]

export default function Dashboard() {
  const { stats, candidates, jobs } = useHR()
  const departments = new Set(jobs.map((j) => j.department)).size
  const topMatches = [...candidates]
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 4)

  const kpis = [
    {
      label: 'Total Candidates',
      value: stats.totalCandidates,
      hint: (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
          +12% vs last month
        </span>
      ),
      icon: Users,
      iconWrap: 'bg-blue-50 text-blue-500',
    },
    {
      label: 'Active Openings',
      value: stats.openJobs,
      hint: <span className="text-xs text-slate-500">{departments} total departments</span>,
      icon: Briefcase,
      iconWrap: 'bg-indigo-50 text-indigo-500',
    },
    {
      label: 'Avg Similarity Score',
      value: `${stats.avgScore}%`,
      hint: <span className="text-xs text-slate-500">AI parsed & weighted</span>,
      icon: Target,
      iconWrap: 'bg-pink-50 text-pink-500',
    },
    {
      label: 'In Interview Stage',
      value: stats.inPipeline,
      hint: <span className="text-xs font-medium text-orange-500">Ready for assessment</span>,
      icon: Clock3,
      iconWrap: 'bg-orange-50 text-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{kpi.value}</p>
                  <div className="mt-2">{kpi.hint}</div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${kpi.iconWrap}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Top Matching Candidates</h2>
            <Link
              to="/candidates"
              className="inline-flex items-center gap-0.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <ul className="space-y-3">
            {topMatches.map((c, idx) => {
              const job = jobs.find((j) => j.id === c.matchedJobId)
              const status = statusMeta(c)
              return (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 sm:flex-nowrap sm:px-4"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarTones[idx % avatarTones.length]}`}
                  >
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{c.name}</p>
                    <p className="truncate text-sm text-slate-500">
                      {job?.title || c.currentTitle}
                      <span className="mx-1.5 text-slate-300">·</span>
                      Applied {c.uploadedAt}
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                    {c.similarityScore}% Match
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <aside className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 p-6 text-white shadow-lg shadow-indigo-200/50">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(165,180,252,0.25), transparent 35%), linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.05) 41%, transparent 41%)',
            }}
          />
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <CloudUpload className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight">Instant AI Resume Parsing</h2>
            <p className="mt-3 text-sm leading-relaxed text-indigo-100">
              Upload PDF or DOCX files. Our NLP engine extracts contact info, skills, and experience,
              then calculates similarity scores against your open roles.
            </p>
            <Link
              to="/upload"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Upload Resume Now
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}
