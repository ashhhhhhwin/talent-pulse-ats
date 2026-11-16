import { ArrowRight, Mail, MapPin, Briefcase } from 'lucide-react'
import ScoreBadge from './ScoreBadge'
import { useHR } from '../context/HRContext'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export default function CandidateCard({ candidate, dense = false }) {
  const { jobs, moveToPipeline } = useHR()
  const job = jobs.find((j) => j.id === candidate.matchedJobId)

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {initials(candidate.name)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{candidate.name}</h3>
            <p className="text-sm text-slate-500">{candidate.currentTitle}</p>
          </div>
        </div>
        <ScoreBadge score={candidate.similarityScore} compact />
      </div>

      {!dense && <p className="mt-3 text-sm leading-relaxed text-slate-600">{candidate.summary}</p>}

      <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
        <span className="inline-flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" /> {candidate.email}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> {candidate.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5" /> {candidate.experienceYears} yrs experience
        </span>
        <span className="inline-flex items-center gap-1.5 truncate">
          Best match: {job?.title || '—'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {candidate.skills.slice(0, 8).map((skill) => (
          <span key={skill} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
            {skill}
          </span>
        ))}
      </div>

      {(candidate.matchedSkills?.length > 0 || candidate.missingSkills?.length > 0) && (
        <div className="mt-3 space-y-1 text-xs">
          {candidate.matchedSkills?.length > 0 && (
            <p className="text-emerald-700">
              Matched: {candidate.matchedSkills.slice(0, 5).join(', ')}
            </p>
          )}
          {candidate.missingSkills?.length > 0 && (
            <p className="text-amber-700">
              Missing: {candidate.missingSkills.slice(0, 4).join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-400">
          Resume: {candidate.resumeFileName} · {candidate.uploadedAt}
        </p>
        {!candidate.pipelineStage ? (
          <button
            type="button"
            onClick={() => moveToPipeline(candidate.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            Move to pipeline <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
            Stage: {candidate.pipelineStage.replace('_', ' ')}
          </span>
        )}
      </div>
    </article>
  )
}
