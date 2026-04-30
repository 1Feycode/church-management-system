import { FEATURES } from './content'

const iconColors = [
  { bg: '#ede9fe', color: '#7c3aed' },
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#d1fae5', color: '#065f46' },
  { bg: '#fef3c7', color: '#92400e' },
  { bg: '#fee2e2', color: '#991b1b' },
]

export default function Features() {
  return (
    <section id="features" style={{ background: '#f9fafb', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-block', background: '#ede9fe', color: '#7c3aed', fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: 100, marginBottom: 16, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {FEATURES.badge}
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#111827', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
            {FEATURES.title}
          </h2>
          <p style={{ fontSize: 18, color: '#6b7280', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            {FEATURES.subtitle}
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {FEATURES.items.map((f, i) => {
            const c = iconColors[i % iconColors.length]
            return (
              <div key={i} style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', border: '1px solid #e5e7eb', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, margin: 0 }}>{f.description}</p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
