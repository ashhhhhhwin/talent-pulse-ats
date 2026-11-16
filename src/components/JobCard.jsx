import { MapPin, Building2, Clock3 } from 'lucide-react'
import ScoreBadge from './ScoreBadge'

export default function JobCard({ job, matchScore, onSelect, selected }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-5 text-left transition ${
        selected
          ? 'border-indigo-400 bg-indigo-50/50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{job.department}</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{job.title}</h3>
        </div>
        {typeof matchScore === 'number' && <ScoreBadge score={matchScore} compact />}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-500">{job.description}</p>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5" /> {job.type}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5" /> {job.experience}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.requiredSkills.slice(0, 5).map((skill) => (
          <span key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {skill}
          </span>
        ))}
        {job.requiredSkills.length > 5 && (
          <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-400">
            +{job.requiredSkills.length - 5}
          </span>
        )}
      </div>
    </button>
  )
}
