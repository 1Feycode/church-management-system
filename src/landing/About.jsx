import { ABOUT } from './content'

export default function About() {
  return (
    <section id="about" style={{ background: '#0f0c29', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 64, flexWrap: 'wrap' }}>

        {/* Left */}
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <div style={{ display: 'inline-block', background: 'rgba(139,92,246,0.2)', color: '#c4b5fd', fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: 100, marginBottom: 20, letterSpacing: '0.5px', textTransform: 'uppercase', border: '1px solid rgba(139,92,246,0.3)' }}>
            {ABOUT.badge}
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#fff', margin: '0 0 20px', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
            {ABOUT.title}
          </h2>
          <p style={{ fontSize: 17, color: '#9ca3af', lineHeight: 1.8, margin: 0 }}>
            {ABOUT.description}
          </p>
        </div>

        {/* Right: audience cards */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {ABOUT.audience.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 22px', backdropFilter: 'blur(10px)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {a.icon}
              </div>
              <div>
                <div style={{ color: '#e5e7eb', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{a.label}</div>
                <div style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.5 }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
