import { useState } from 'react'
import { useHR } from '../context/HRContext'
import PipelineBoard from '../components/PipelineBoard'
import ScoreBadge from '../components/ScoreBadge'

export default function Pipeline() {
  const { candidates, jobs, stages, updatePipelineStage, updateNotes } = useHR()
  const inPipeline = candidates.filter((c) => c.pipelineStage)
  const [selectedId, setSelectedId] = useState(inPipeline[0]?.id || null)
  const selected = candidates.find((c) => c.id === selectedId)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Interview Pipeline</h2>
        <p className="mt-1 text-sm text-slate-500">
          Jira-style board — drag candidate cards across rounds from screening to offer and hire.
        </p>
      </div>

      <PipelineBoard />

      <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Candidates on board</p>
          <ul className="mt-3 space-y-1.5">
            {inPipeline.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                    selectedId === c.id ? 'bg-indigo-50 text-indigo-800' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="mt-0.5 block text-xs capitalize text-slate-400">
                    {c.pipelineStage?.replace('_', ' ')}
                  </span>
                </button>
              </li>
            ))}
            {inPipeline.length === 0 && (
              <li className="text-xs text-slate-400">No candidates in pipeline yet. Move someone from Candidates.</li>
            )}
          </ul>
        </div>

        {selected ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{selected.name}</h3>
                <p className="text-sm text-slate-500">
                  {jobs.find((j) => j.id === selected.matchedJobId)?.title} · {selected.email}
                </p>
              </div>
              <ScoreBadge score={selected.similarityScore} />
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-500">Advance stage</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {stages.map((stage) => (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => updatePipelineStage(selected.id, stage.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      selected.pipelineStage === stage.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {stage.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-500">Interview notes</label>
              <textarea
                value={selected.notes || ''}
                onChange={(e) => updateNotes(selected.id, e.target.value)}
                rows={4}
                placeholder="Add feedback from the latest round…"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-10 text-sm text-slate-400">
            Select a candidate to manage stage and notes.
          </div>
        )}
      </section>
    </div>
  )
}
