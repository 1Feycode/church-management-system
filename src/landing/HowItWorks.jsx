import { HOW_IT_WORKS } from './content'

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: '#fff', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ display: 'inline-block', background: '#ede9fe', color: '#7c3aed', fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: 100, marginBottom: 16, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {HOW_IT_WORKS.badge}
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
            {HOW_IT_WORKS.title}
          </h2>
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, position: 'relative' }}>
          {HOW_IT_WORKS.steps.map((s, i) => (
            <div key={i} style={{ position: 'relative' }}>
              {/* Connector line (desktop only) */}
              {i < HOW_IT_WORKS.steps.length - 1 && (
                <div style={{ position: 'absolute', top: 28, left: 'calc(100% - 16px)', width: 32, height: 2, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', zIndex: 1, display: 'none' }} className="step-connector" />
              )}

              <div style={{ background: 'linear-gradient(160deg, #faf5ff 0%, #f5f3ff 100%)', border: '1px solid #ede9fe', borderRadius: 20, padding: '36px 28px', height: '100%' }}>
                {/* Step number circle */}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 8px 20px rgba(124,58,237,0.3)' }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{s.step}</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, margin: 0 }}>{s.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
