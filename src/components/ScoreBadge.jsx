import { scoreLabel } from '../utils/similarity'

export default function ScoreBadge({ score, compact = false }) {
  const meta = scoreLabel(score)
  const tones = {
    Excellent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Strong: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    Moderate: 'text-amber-700 bg-amber-50 border-amber-200',
    Low: 'text-rose-700 bg-rose-50 border-rose-200',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[meta.label] || meta.tone}`}
    >
      <span className="text-sm font-bold">{score}%</span>
      <span className="opacity-80">{compact ? 'Match' : meta.label}</span>
    </span>
  )
}
