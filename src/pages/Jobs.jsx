import { useMemo, useState } from 'react'
import { useHR } from '../context/HRContext'
import JobCard from '../components/JobCard'
import ScoreBadge from '../components/ScoreBadge'

export default function Jobs() {
  const { jobs, candidates } = useHR()
  const [selectedId, setSelectedId] = useState(jobs[0]?.id)

  const selected = jobs.find((j) => j.id === selectedId) || jobs[0]
  const matched = useMemo(
    () =>
      candidates
        .filter((c) => c.matchedJobId === selected?.id)
        .sort((a, b) => b.similarityScore - a.similarityScore),
    [candidates, selected],
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Job Openings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select a role to see candidates ranked by resume similarity score.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => {
            const top = candidates
              .filter((c) => c.matchedJobId === job.id)
              .sort((a, b) => b.similarityScore - a.similarityScore)[0]
            return (
              <JobCard
                key={job.id}
                job={job}
                selected={selected?.id === job.id}
                matchScore={top?.similarityScore}
                onSelect={() => setSelectedId(job.id)}
              />
            )
          })}
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-28 xl:self-start">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">Role detail</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">{selected?.title}</h3>
          <p className="mt-2 text-sm text-slate-500">{selected?.description}</p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-700">Required skills</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selected?.requiredSkills.map((s) => (
                <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Matched candidates</p>
              <span className="text-xs text-slate-400">{matched.length}</span>
            </div>
            <ul className="mt-3 space-y-2">
              {matched.length === 0 && (
                <li className="rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-400">
                  No candidates matched to this role yet.
                </li>
              )}
              {matched.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{c.name}</p>
                    <p className="truncate text-xs text-slate-500">{c.currentTitle}</p>
                  </div>
                  <ScoreBadge score={c.similarityScore} compact />
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
