import { useNavigate } from 'react-router-dom'
import { SITE, FOOTER, NAV_LINKS } from './content'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer style={{ background: '#0a0a0f', padding: '56px 24px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 48 }}>
          {/* Brand */}
          <div style={{ maxWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✝️</div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{SITE.name}</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              A complete church management platform built for modern congregations.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: '#e5e7eb', fontWeight: 700, fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Navigation</div>
              {NAV_LINKS.map(link => (
                <button key={link.label} onClick={() => document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ display: 'block', background: 'none', border: 'none', color: '#6b7280', fontSize: 14, padding: '4px 0', cursor: 'pointer', marginBottom: 8 }}>
                  {link.label}
                </button>
              ))}
            </div>
            <div>
              <div style={{ color: '#e5e7eb', fontWeight: 700, fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account</div>
              {FOOTER.links.map((link, i) => (
                <button key={i} onClick={() => navigate(link.href)}
                  style={{ display: 'block', background: 'none', border: 'none', color: '#6b7280', fontSize: 14, padding: '4px 0', cursor: 'pointer', marginBottom: 8 }}>
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />

        {/* Bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: '#4b5563', fontSize: 13, margin: 0 }}>{FOOTER.copyright}</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {['🌐', '📧', '📱'].map((icon, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer' }}>
                {icon}
              </div>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
