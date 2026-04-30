import { HOW_IT_WORKS } from './content'

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto text-center">

        <span className="inline-block bg-violet-100 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          {HOW_IT_WORKS.badge}
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-12">
          {HOW_IT_WORKS.title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          {HOW_IT_WORKS.steps.map((s, i) => (
            <div key={i} className="bg-violet-50 border border-violet-100 rounded-2xl p-8">
              <div className="text-5xl font-black text-violet-200 leading-none mb-4">{s.step}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
