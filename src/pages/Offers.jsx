import { useState } from 'react'
import { Send, BadgeCheck } from 'lucide-react'
import { useHR } from '../context/HRContext'
import ScoreBadge from '../components/ScoreBadge'

export default function Offers() {
  const { candidates, jobs, releaseOffer, markHired, updatePipelineStage } = useHR()
  const offerPool = candidates.filter(
    (c) => c.pipelineStage === 'offer' || c.pipelineStage === 'hired' || c.offer,
  )

  const [forms, setForms] = useState(() =>
    Object.fromEntries(
      offerPool.map((c) => [
        c.id,
        {
          salary: c.offer?.salary && c.offer.salary !== 'Suggesting package…' ? c.offer.salary : '28 LPA',
          joiningDate: c.offer?.joiningDate || '2026-09-30',
          bonus: c.offer?.bonus || 'Signing bonus 1 Lakh',
        },
      ]),
    ),
  )

  const updateForm = (id, field, value) => {
    setForms((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { salary: '28 LPA', joiningDate: '2026-09-30', bonus: 'Signing bonus 1 Lakh' }),
        [field]: value,
      },
    }))
  }

  const ensureForm = (c) =>
    forms[c.id] || {
      salary: '28 LPA',
      joiningDate: '2026-09-30',
      bonus: 'Signing bonus 1 Lakh',
    }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Offer release</h2>
        <p className="mt-1 text-sm text-slate-500">
          Candidates in the Offer column can receive a package and move to Hired.
        </p>
      </div>

      {offerPool.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          No candidates in offer stage yet. Move someone to Offer on the pipeline board.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {offerPool.map((c) => {
          const job = jobs.find((j) => j.id === c.matchedJobId)
          const form = ensureForm(c)
          const released = c.offer?.status === 'released'
          const hired = c.pipelineStage === 'hired' || c.status === 'hired'

          return (
            <article key={c.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{c.name}</h3>
                  <p className="text-sm text-slate-500">{job?.title}</p>
                </div>
                <ScoreBadge score={c.similarityScore} compact />
              </div>

              {!c.pipelineStage || (c.pipelineStage !== 'offer' && c.pipelineStage !== 'hired') ? (
                <button
                  type="button"
                  onClick={() => updatePipelineStage(c.id, 'offer')}
                  className="mt-4 text-xs font-semibold text-indigo-700 hover:underline"
                >
                  Move to Offer stage
                </button>
              ) : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="text-xs text-slate-500">CTC / Salary</span>
                  <input
                    value={form.salary}
                    disabled={released || hired}
                    onChange={(e) => updateForm(c.id, 'salary', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 disabled:opacity-70"
                  />
                </label>
                <label className="text-sm">
                  <span className="text-xs text-slate-500">Joining date</span>
                  <input
                    type="date"
                    value={form.joiningDate}
                    disabled={released || hired}
                    onChange={(e) => updateForm(c.id, 'joiningDate', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 disabled:opacity-70"
                  />
                </label>
                <label className="sm:col-span-2 text-sm">
                  <span className="text-xs text-slate-500">Additional terms</span>
                  <input
                    value={form.bonus}
                    disabled={released || hired}
                    onChange={(e) => updateForm(c.id, 'bonus', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 disabled:opacity-70"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {!released && !hired && (
                  <button
                    type="button"
                    onClick={() => releaseOffer(c.id, form)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                  >
                    <Send className="h-4 w-4" /> Release offer
                  </button>
                )}
                {(released || c.pipelineStage === 'offer') && !hired && (
                  <button
                    type="button"
                    onClick={() => markHired(c.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <BadgeCheck className="h-4 w-4" /> Mark hired
                  </button>
                )}
                {hired && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" /> Hired
                  </span>
                )}
                {released && !hired && (
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                    Offer released {c.offer?.releasedAt}
                  </span>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
