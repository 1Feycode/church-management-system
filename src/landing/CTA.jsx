import { useNavigate } from 'react-router-dom'
import { CTA } from './content'

export default function CTASection() {
  const navigate = useNavigate()

  return (
    <section style={{ background: '#f9fafb', padding: '96px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #6d28d9 100%)', borderRadius: 28, padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 24px 80px rgba(124,58,237,0.4)' }}>
          {/* Glow orbs */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(167,139,250,0.2)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(196,181,253,0.15)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
              {CTA.title}
            </h2>
            <p style={{ fontSize: 18, color: '#ddd6fe', margin: '0 0 36px', lineHeight: 1.6 }}>
              {CTA.subtitle}
            </p>
            <button onClick={() => navigate('/signup')}
              style={{ background: '#fff', border: 'none', color: '#7c3aed', fontWeight: 800, fontSize: 17, padding: '16px 40px', borderRadius: 14, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', letterSpacing: '-0.2px' }}>
              {CTA.btn}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
