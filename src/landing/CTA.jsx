import { useNavigate } from 'react-router-dom'
import { CTA } from './content'

export default function CTASection() {
  const navigate = useNavigate()

  return (
    <section className="bg-gradient-to-br from-violet-700 via-violet-600 to-purple-500 py-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
          {CTA.title}
        </h2>
        <p className="text-violet-200 text-lg mb-8 leading-relaxed">
          {CTA.subtitle}
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-white hover:bg-gray-50 text-violet-700 font-bold text-base px-8 py-4 rounded-xl transition-colors shadow-lg"
        >
          {CTA.btn}
        </button>
      </div>
    </section>
  )
}
