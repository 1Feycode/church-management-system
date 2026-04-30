import { ABOUT } from './content'

export default function About() {
  return (
    <section id="about" className="bg-gray-50 py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <span className="inline-block bg-violet-100 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            {ABOUT.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5">
            {ABOUT.title}
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
            {ABOUT.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {ABOUT.audience.map((a, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="text-4xl mb-3">{a.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{a.label}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
