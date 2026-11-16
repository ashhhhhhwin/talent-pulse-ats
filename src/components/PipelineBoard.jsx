import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import ScoreBadge from './ScoreBadge'
import { useHR } from '../context/HRContext'

function PipelineCard({ candidate, job }) {
  const onDragStart = (e) => {
    e.dataTransfer.setData('text/candidate-id', candidate.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{candidate.name}</p>
          <p className="truncate text-xs text-slate-500">{job?.title || 'Unassigned role'}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <ScoreBadge score={candidate.similarityScore} compact />
            <span className="text-[10px] text-slate-400">{candidate.experienceYears}y</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PipelineBoard() {
  const { candidates, jobs, stages, updatePipelineStage } = useHR()
  const [dragOverStage, setDragOverStage] = useState(null)

  const pipelineCandidates = candidates.filter((c) => c.pipelineStage)

  const onDrop = (stageId, e) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/candidate-id')
    if (id) updatePipelineStage(id, stageId)
    setDragOverStage(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const cards = pipelineCandidates.filter((c) => c.pipelineStage === stage.id)
        return (
          <section
            key={stage.id}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverStage(stage.id)
            }}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={(e) => onDrop(stage.id, e)}
            className={`flex w-72 shrink-0 flex-col rounded-xl border bg-slate-50 ${
              dragOverStage === stage.id ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-200'
            }`}
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-3 py-3">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                <h3 className="text-sm font-semibold text-slate-800">{stage.label}</h3>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                {cards.length}
              </span>
            </header>

            <div className="flex min-h-[220px] flex-col gap-2.5 p-3">
              {cards.map((candidate) => (
                <PipelineCard
                  key={candidate.id}
                  candidate={candidate}
                  job={jobs.find((j) => j.id === candidate.matchedJobId)}
                />
              ))}
              {cards.length === 0 && (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                  Drop cards here
                </div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
