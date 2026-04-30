import { useNavigate } from 'react-router-dom'
import { SITE, FOOTER } from './content'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-gray-900 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-center">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{SITE.logo}</span>
          <span className="text-lg font-extrabold text-white">{SITE.name}</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4">
          {FOOTER.links.map((link, i) => (
            <button
              key={i}
              onClick={() => navigate(link.href)}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-gray-500 text-sm">{FOOTER.copyright}</p>

      </div>
    </footer>
  )
}
