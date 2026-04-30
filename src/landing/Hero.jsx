import { useNavigate } from 'react-router-dom'
import { HERO } from './content'

export default function Hero() {
  const navigate = useNavigate()

  function scrollToFeatures() {
    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

      {/* Text */}
      <div className="flex-1 text-center lg:text-left">
        <span className="inline-block bg-violet-100 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          {HERO.badge}
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-5">
          {HERO.headline}<br />
          <span className="text-violet-600">{HERO.headlineAccent}</span>
        </h1>

        <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
          {HERO.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
          <button
            onClick={() => navigate('/login')}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-base px-7 py-3.5 rounded-xl transition-colors"
          >
            {HERO.primaryBtn}
          </button>
          <button
            onClick={scrollToFeatures}
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-base px-7 py-3.5 rounded-xl border border-gray-200 transition-colors"
          >
            {HERO.secondaryBtn}
          </button>
        </div>
      </div>

      {/* Dashboard preview card */}
      <div className="flex-1 flex justify-center w-full max-w-sm lg:max-w-none">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-xs">
          {/* Window dots */}
          <div className="flex gap-1.5 mb-5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          {/* Stats rows */}
          <div className="flex flex-col gap-3">
            {HERO.stats.map((s, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className="text-xs text-gray-400 font-medium">{s.label}</div>
                  <div className="text-xl font-black text-gray-900">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}
