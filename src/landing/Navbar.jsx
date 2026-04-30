import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SITE, NAV_LINKS } from './content'

export default function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(href) {
    setMenuOpen(false)
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: scrolled ? '1px solid #e5e7eb' : '1px solid transparent',
      transition: 'all 0.3s ease',
      boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : 'none'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ✝️
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>{SITE.name}</span>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
          {NAV_LINKS.map(link => (
            <button key={link.label} onClick={() => scrollTo(link.href)}
              style={{ background: 'none', border: 'none', color: '#6b7280', fontWeight: 500, fontSize: 15, padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hidden-mobile">
          <button onClick={() => navigate('/login')}
            style={{ background: 'none', border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 600, fontSize: 14, padding: '9px 20px', borderRadius: 10, cursor: 'pointer' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/login')}
            style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, padding: '9px 20px', borderRadius: 10, cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
            Get Started →
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(v => !v)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8 }}
          className="show-mobile" aria-label="Menu">
          <div style={{ width: 22, height: 2, background: '#374151', borderRadius: 2, marginBottom: 5, transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
          <div style={{ width: 22, height: 2, background: '#374151', borderRadius: 2, marginBottom: 5, opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
          <div style={{ width: 22, height: 2, background: '#374151', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ borderTop: '1px solid #f3f4f6', background: '#fff', padding: '12px 16px 16px' }}>
          {NAV_LINKS.map(link => (
            <button key={link.label} onClick={() => scrollTo(link.href)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#374151', fontWeight: 500, fontSize: 15, padding: '10px 12px', borderRadius: 8, cursor: 'pointer' }}>
              {link.label}
            </button>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
            <button onClick={() => { setMenuOpen(false); navigate('/login') }}
              style={{ flex: 1, border: '1.5px solid #e5e7eb', background: 'none', color: '#374151', fontWeight: 600, fontSize: 14, padding: '11px', borderRadius: 10, cursor: 'pointer' }}>
              Sign In
            </button>
            <button onClick={() => { setMenuOpen(false); navigate('/login') }}
              style={{ flex: 1, background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, padding: '11px', borderRadius: 10, cursor: 'pointer' }}>
              Get Started
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
