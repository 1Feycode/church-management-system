import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SITE, NAV_LINKS } from './content'

export default function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function scrollTo(href) {
    setMenuOpen(false)
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-3xl">{SITE.logo}</span>
          <span className="text-xl font-extrabold text-gray-900">{SITE.name}</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className="text-gray-500 hover:text-gray-900 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-700 font-semibold text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-50"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-gray-700 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-700 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-700 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-2">
          {NAV_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className="text-left text-gray-600 font-medium text-sm px-3 py-2.5 rounded-lg hover:bg-gray-50"
            >
              {link.label}
            </button>
          ))}
          <div className="flex gap-2 pt-2 border-t border-gray-100 mt-1">
            <button
              onClick={() => { setMenuOpen(false); navigate('/login') }}
              className="flex-1 text-gray-700 font-semibold text-sm py-2.5 rounded-lg border border-gray-200"
            >
              Sign In
            </button>
            <button
              onClick={() => { setMenuOpen(false); navigate('/login') }}
              className="flex-1 bg-violet-600 text-white font-semibold text-sm py-2.5 rounded-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
