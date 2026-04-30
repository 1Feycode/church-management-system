import { FEATURES } from './content'

export default function Features() {
  return (
    <section id="features" className="bg-gray-50 py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto text-center">

        <span className="inline-block bg-violet-100 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          {FEATURES.badge}
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
          {FEATURES.title}
        </h2>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
          {FEATURES.subtitle}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {FEATURES.items.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
