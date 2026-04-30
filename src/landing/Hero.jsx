import { useNavigate } from 'react-router-dom'
import { HERO } from './content'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section style={{
      background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      padding: '80px 24px 100px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap', position: 'relative' }}>

        {/* Left: text */}
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 100, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ fontSize: 14 }}>✨</span>
            <span style={{ color: '#c4b5fd', fontSize: 13, fontWeight: 600 }}>{HERO.badge}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.1, color: '#fff', margin: '0 0 20px', letterSpacing: '-1px' }}>
            {HERO.headline}<br />
            <span style={{ background: 'linear-gradient(90deg, #a78bfa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {HERO.headlineAccent}
            </span>
          </h1>

          <p style={{ fontSize: 18, color: '#9ca3af', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 480 }}>
            {HERO.description}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')}
              style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 16, padding: '14px 32px', borderRadius: 12, cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.45)', letterSpacing: '-0.2px' }}>
              {HERO.primaryBtn}
            </button>
            <button onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e5e7eb', fontWeight: 600, fontSize: 16, padding: '14px 32px', borderRadius: 12, cursor: 'pointer' }}>
              {HERO.secondaryBtn}
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 40, flexWrap: 'wrap' }}>
            {['Free forever', 'No credit card', 'Setup in 2 min'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#a78bfa', fontSize: 14 }}>✓</span>
                <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: dashboard card */}
        <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
            {/* Window chrome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171', display: 'block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', display: 'block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', display: 'block' }} />
              </div>
              <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
            </div>

            {/* Header */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#e5e7eb', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Church Dashboard</div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Welcome back, Pastor John</div>
            </div>

            {/* Stat rows */}
            {HERO.stats.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', marginBottom: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>{s.label}</span>
                </div>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{s.value}</span>
              </div>
            ))}

            {/* Mini progress bar */}
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(139,92,246,0.15)', borderRadius: 12, border: '1px solid rgba(139,92,246,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#c4b5fd', fontSize: 12, fontWeight: 600 }}>Monthly Growth</span>
                <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 700 }}>+12%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: '72%', background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: 3 }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
