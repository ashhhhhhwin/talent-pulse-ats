export default function StatCard({ label, value, hint, accent = 'brand' }) {
  const accents = {
    brand: 'from-brand-500/15 to-transparent text-brand-700',
    ink: 'from-ink-500/10 to-transparent text-ink-700',
    amber: 'from-amber-500/15 to-transparent text-amber-700',
    emerald: 'from-emerald-500/15 to-transparent text-emerald-700',
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-ink-200 bg-white p-5 shadow-sm`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accents[accent]}`} />
      <div className="relative">
        <p className="text-sm text-ink-500">{label}</p>
        <p className="mt-2 font-display text-3xl font-semibold text-ink-900">{value}</p>
        {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      </div>
    </div>
  )
}
