import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useHR } from '../context/HRContext'
import CandidateCard from '../components/CandidateCard'

export default function Candidates() {
  const { candidates, jobs } = useHR()
  const [query, setQuery] = useState('')
  const [jobFilter, setJobFilter] = useState('all')
  const [minScore, setMinScore] = useState(0)

  const filtered = useMemo(() => {
    return candidates
      .filter((c) => {
        const q = query.toLowerCase()
        const textMatch =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q)) ||
          c.email.toLowerCase().includes(q)
        const jobMatch = jobFilter === 'all' || c.matchedJobId === jobFilter
        const scoreMatch = c.similarityScore >= minScore
        return textMatch && jobMatch && scoreMatch
      })
      .sort((a, b) => b.similarityScore - a.similarityScore)
  }, [candidates, query, jobFilter, minScore])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Candidates & Scoring</h2>
        <p className="mt-1 text-sm text-slate-500">
          Similarity is computed from required skills, preferred skills, and experience fit.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end">
        <label className="flex-1">
          <span className="text-xs font-medium text-slate-500">Search</span>
          <div className="relative mt-1">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, skill, or email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </label>
        <label className="lg:w-56">
          <span className="text-xs font-medium text-slate-500">Job match</span>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="all">All roles</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </label>
        <label className="lg:w-44">
          <span className="text-xs font-medium text-slate-500">Min score: {minScore}%</span>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="mt-3 w-full accent-indigo-600"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((c) => (
          <CandidateCard key={c.id} candidate={c} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
            No candidates match these filters.
          </div>
        )}
      </div>
    </div>
  )
}
