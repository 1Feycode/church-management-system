import { METRICS } from './content'

export default function Metrics() {
  return (
    <section className="bg-violet-600 py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
        {METRICS.map((m, i) => (
          <div key={i}>
            <div className="text-4xl sm:text-5xl font-black text-white mb-1">{m.number}</div>
            <div className="text-violet-200 font-medium text-sm sm:text-base">{m.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
