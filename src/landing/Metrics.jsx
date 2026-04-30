import { METRICS } from './content'

export default function Metrics() {
  return (
    <section style={{ background: '#fff', borderBottom: '1px solid #f3f4f6', padding: '48px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, textAlign: 'center' }}>
        {METRICS.map((m, i) => (
          <div key={i}>
            <div style={{ fontSize: 42, fontWeight: 900, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 6 }}>
              {m.number}
            </div>
            <div style={{ color: '#6b7280', fontWeight: 500, fontSize: 15 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
