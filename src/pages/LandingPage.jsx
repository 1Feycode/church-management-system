import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()

  const features = [
    { icon: '👥', title: 'Member Management', desc: 'Track member profiles, attendance, and spiritual growth in one place.' },
    { icon: '📅', title: 'Events & Schedule', desc: 'Plan and manage church services, meetings, and special events easily.' },
    { icon: '🙏', title: 'Prayer Requests', desc: 'Submit and manage prayer requests with privacy controls for the congregation.' },
    { icon: '📖', title: 'Bible Studies', desc: 'Publish and discuss Bible study content with interactive comments.' },
    { icon: '👨‍👩‍👧‍👦', title: 'Groups & Ministries', desc: 'Organize members into groups with leader assignment and attendance tracking.' },
    { icon: '🔔', title: 'Notifications', desc: 'Stay updated with real-time notifications for comments and activities.' },
  ]

  const stats = [
    { number: '100%', label: 'Free to Use' },
    { number: '9+', label: 'Core Features' },
    { number: '24/7', label: 'Always Available' },
    { number: '∞', label: 'Members Supported' },
  ]

  return (
    <div style={styles.page}>

      {/* ── NAVBAR ── */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⛪</span>
            <span style={styles.logoText}>ChurchMS</span>
          </div>
          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#about" style={styles.navLink}>About</a>
            <button onClick={() => navigate('/login')} style={styles.navLoginBtn}>
              Sign In
            </button>
            <button onClick={() => navigate('/login')} style={styles.navSignupBtn}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroBadge}>✨ Church Management Made Simple</div>
          <h1 style={styles.heroTitle}>
            Manage Your Church<br />
            <span style={styles.heroTitleAccent}>With Confidence</span>
          </h1>
          <p style={styles.heroSubtitle}>
            A complete platform to manage members, events, prayer requests,
            Bible studies, and more — all in one place.
          </p>
          <div style={styles.heroCTA}>
            <button onClick={() => navigate('/login')} style={styles.ctaPrimary}>
              Get Started Free →
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              style={styles.ctaSecondary}
            >
              See Features
            </button>
          </div>
        </div>

        {/* Hero visual */}
        <div style={styles.heroVisual}>
          <div style={styles.heroCard}>
            <div style={styles.heroCardHeader}>
              <span style={styles.heroCardDot} />
              <span style={{ ...styles.heroCardDot, backgroundColor: '#fbbf24' }} />
              <span style={{ ...styles.heroCardDot, backgroundColor: '#34d399' }} />
            </div>
            <div style={styles.heroCardBody}>
              <div style={styles.heroCardRow}>
                <span style={styles.heroCardIcon}>👥</span>
                <div>
                  <div style={styles.heroCardLabel}>Total Members</div>
                  <div style={styles.heroCardValue}>248</div>
                </div>
              </div>
              <div style={styles.heroCardRow}>
                <span style={styles.heroCardIcon}>📅</span>
                <div>
                  <div style={styles.heroCardLabel}>Upcoming Events</div>
                  <div style={styles.heroCardValue}>12</div>
                </div>
              </div>
              <div style={styles.heroCardRow}>
                <span style={styles.heroCardIcon}>🙏</span>
                <div>
                  <div style={styles.heroCardLabel}>Prayer Requests</div>
                  <div style={styles.heroCardValue}>34</div>
                </div>
              </div>
              <div style={styles.heroCardRow}>
                <span style={styles.heroCardIcon}>📖</span>
                <div>
                  <div style={styles.heroCardLabel}>Bible Studies</div>
                  <div style={styles.heroCardValue}>18</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          {stats.map((s, i) => (
            <div key={i} style={styles.statItem}>
              <div style={styles.statNumber}>{s.number}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionBadge}>Features</div>
          <h2 style={styles.sectionTitle}>Everything Your Church Needs</h2>
          <p style={styles.sectionSubtitle}>
            Built specifically for churches — simple, powerful, and easy to use.
          </p>
          <div style={styles.featuresGrid}>
            {features.map((f, i) => (
              <div key={i} style={styles.featureCard}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="about" style={styles.howSection}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionBadge}>How It Works</div>
          <h2 style={styles.sectionTitle}>Up and Running in Minutes</h2>
          <div style={styles.stepsGrid}>
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with Google or email in seconds.' },
              { step: '02', title: 'Complete Profile', desc: 'Fill in your member profile information.' },
              { step: '03', title: 'Start Managing', desc: 'Access all features from your dashboard.' },
            ].map((s, i) => (
              <div key={i} style={styles.stepCard}>
                <div style={styles.stepNumber}>{s.step}</div>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={styles.ctaBanner}>
        <div style={styles.ctaBannerInner}>
          <h2 style={styles.ctaBannerTitle}>Ready to Get Started?</h2>
          <p style={styles.ctaBannerSubtitle}>
            Join your church community today. Free forever.
          </p>
          <button onClick={() => navigate('/login')} style={styles.ctaBannerBtn}>
            Create Your Account →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerLogo}>
            <span style={styles.logoIcon}>⛪</span>
            <span style={styles.footerLogoText}>ChurchMS</span>
          </div>
          <p style={styles.footerText}>
            Built with ❤️ for churches everywhere.
          </p>
          <div style={styles.footerLinks}>
            <button onClick={() => navigate('/login')} style={styles.footerLink}>Sign In</button>
            <span style={styles.footerDivider}>·</span>
            <button onClick={() => navigate('/login')} style={styles.footerLink}>Sign Up</button>
          </div>
        </div>
      </footer>

    </div>
  )
}

const styles = {
  page: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1f2937',
    backgroundColor: '#ffffff',
    overflowX: 'hidden'
  },

  // NAV
  nav: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e5e7eb',
    zIndex: 100,
    padding: '0 24px'
  },
  navInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px'
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { fontSize: '28px' },
  logoText: { fontSize: '20px', fontWeight: '800', color: '#1f2937' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '8px' },
  navLink: {
    color: '#6b7280', fontSize: '15px', fontWeight: '500',
    textDecoration: 'none', padding: '8px 12px', borderRadius: '6px'
  },
  navLoginBtn: {
    backgroundColor: 'transparent', border: '1px solid #d1d5db',
    color: '#374151', padding: '8px 16px', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  navSignupBtn: {
    backgroundColor: '#8b5cf6', border: 'none',
    color: '#ffffff', padding: '8px 16px', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },

  // HERO
  hero: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '80px 24px 60px',
    display: 'flex',
    alignItems: 'center',
    gap: '60px',
    flexWrap: 'wrap'
  },
  heroInner: { flex: '1', minWidth: '300px' },
  heroBadge: {
    display: 'inline-block',
    backgroundColor: '#f3e8ff',
    color: '#7c3aed',
    fontSize: '13px',
    fontWeight: '600',
    padding: '6px 14px',
    borderRadius: '20px',
    marginBottom: '24px'
  },
  heroTitle: {
    fontSize: '52px',
    fontWeight: '900',
    lineHeight: '1.15',
    color: '#111827',
    margin: '0 0 20px 0'
  },
  heroTitleAccent: { color: '#8b5cf6' },
  heroSubtitle: {
    fontSize: '18px',
    color: '#6b7280',
    lineHeight: '1.7',
    margin: '0 0 36px 0',
    maxWidth: '480px'
  },
  heroCTA: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  ctaPrimary: {
    backgroundColor: '#8b5cf6', color: '#ffffff', border: 'none',
    padding: '14px 28px', borderRadius: '10px', fontSize: '16px',
    fontWeight: '700', cursor: 'pointer'
  },
  ctaSecondary: {
    backgroundColor: '#f9fafb', color: '#374151',
    border: '1px solid #e5e7eb', padding: '14px 28px',
    borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer'
  },

  // HERO VISUAL
  heroVisual: { flex: '1', minWidth: '280px', display: 'flex', justifyContent: 'center' },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
    padding: '24px',
    width: '100%',
    maxWidth: '320px',
    border: '1px solid #e5e7eb'
  },
  heroCardHeader: { display: 'flex', gap: '6px', marginBottom: '20px' },
  heroCardDot: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f87171' },
  heroCardBody: { display: 'flex', flexDirection: 'column', gap: '16px' },
  heroCardRow: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '12px', backgroundColor: '#f9fafb', borderRadius: '10px'
  },
  heroCardIcon: { fontSize: '24px' },
  heroCardLabel: { fontSize: '12px', color: '#9ca3af', fontWeight: '500' },
  heroCardValue: { fontSize: '22px', fontWeight: '800', color: '#1f2937' },

  // STATS
  statsSection: {
    backgroundColor: '#8b5cf6',
    padding: '48px 24px'
  },
  statsGrid: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '32px',
    textAlign: 'center'
  },
  statItem: {},
  statNumber: { fontSize: '40px', fontWeight: '900', color: '#ffffff', marginBottom: '6px' },
  statLabel: { fontSize: '15px', color: '#ddd6fe', fontWeight: '500' },

  // FEATURES
  featuresSection: { padding: '80px 24px', backgroundColor: '#f9fafb' },
  sectionInner: { maxWidth: '1100px', margin: '0 auto', textAlign: 'center' },
  sectionBadge: {
    display: 'inline-block',
    backgroundColor: '#ede9fe', color: '#7c3aed',
    fontSize: '13px', fontWeight: '600',
    padding: '6px 14px', borderRadius: '20px', marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '36px', fontWeight: '800', color: '#111827',
    margin: '0 0 16px 0'
  },
  sectionSubtitle: {
    fontSize: '17px', color: '#6b7280', margin: '0 auto 48px',
    maxWidth: '520px', lineHeight: '1.7'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    textAlign: 'left'
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb'
  },
  featureIcon: { fontSize: '36px', marginBottom: '16px' },
  featureTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 10px 0' },
  featureDesc: { fontSize: '15px', color: '#6b7280', lineHeight: '1.6', margin: 0 },

  // HOW IT WORKS
  howSection: { padding: '80px 24px', backgroundColor: '#ffffff' },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '32px',
    marginTop: '48px',
    textAlign: 'left'
  },
  stepCard: {
    padding: '32px',
    backgroundColor: '#faf5ff',
    borderRadius: '14px',
    border: '1px solid #ede9fe'
  },
  stepNumber: {
    fontSize: '48px', fontWeight: '900', color: '#ddd6fe',
    lineHeight: '1', marginBottom: '16px'
  },
  stepTitle: { fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 10px 0' },
  stepDesc: { fontSize: '15px', color: '#6b7280', lineHeight: '1.6', margin: 0 },

  // CTA BANNER
  ctaBanner: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
    padding: '80px 24px'
  },
  ctaBannerInner: { maxWidth: '600px', margin: '0 auto', textAlign: 'center' },
  ctaBannerTitle: {
    fontSize: '40px', fontWeight: '900', color: '#ffffff',
    margin: '0 0 16px 0'
  },
  ctaBannerSubtitle: {
    fontSize: '18px', color: '#ede9fe',
    margin: '0 0 36px 0', lineHeight: '1.6'
  },
  ctaBannerBtn: {
    backgroundColor: '#ffffff', color: '#7c3aed',
    border: 'none', padding: '16px 36px',
    borderRadius: '12px', fontSize: '17px',
    fontWeight: '700', cursor: 'pointer'
  },

  // FOOTER
  footer: { backgroundColor: '#111827', padding: '40px 24px' },
  footerInner: { maxWidth: '1100px', margin: '0 auto', textAlign: 'center' },
  footerLogo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' },
  footerLogoText: { fontSize: '20px', fontWeight: '800', color: '#ffffff' },
  footerText: { color: '#9ca3af', fontSize: '14px', margin: '0 0 16px 0' },
  footerLinks: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' },
  footerLink: {
    backgroundColor: 'transparent', border: 'none',
    color: '#9ca3af', fontSize: '14px', cursor: 'pointer'
  },
  footerDivider: { color: '#4b5563' }
}

export default LandingPage
