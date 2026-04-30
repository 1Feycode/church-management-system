// ─────────────────────────────────────────────────────────────
// LANDING PAGE CONTENT
// Edit this file to update all text on the landing page.
// ─────────────────────────────────────────────────────────────

export const SITE = {
  name: 'ChurchMS',
  logo: '⛪',
  tagline: 'Church Management Made Simple',
}

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
]

export const HERO = {
  badge: '✨ Built for Churches',
  headline: 'Manage Your Church',
  headlineAccent: 'With Confidence',
  description:
    'A complete platform to manage members, events, prayer requests, Bible studies, and more — all in one place.',
  primaryBtn: 'Get Started Free →',
  secondaryBtn: 'See Features',
  // Mock dashboard stats shown in the hero card
  stats: [
    { icon: '👥', label: 'Total Members', value: '248' },
    { icon: '📅', label: 'Upcoming Events', value: '12' },
    { icon: '🙏', label: 'Prayer Requests', value: '34' },
    { icon: '📖', label: 'Bible Studies', value: '18' },
  ],
}

export const METRICS = [
  { number: '100%', label: 'Free to Use' },
  { number: '9+', label: 'Core Features' },
  { number: '24/7', label: 'Always Available' },
  { number: '∞', label: 'Members Supported' },
]

export const FEATURES = {
  badge: 'Features',
  title: 'Everything Your Church Needs',
  subtitle: 'Built specifically for churches — simple, powerful, and easy to use.',
  items: [
    {
      icon: '👥',
      title: 'Member Management',
      description:
        'Track member profiles, attendance, and spiritual growth in one place.',
    },
    {
      icon: '📅',
      title: 'Events & Schedule',
      description:
        'Plan and manage church services, meetings, and special events easily.',
    },
    {
      icon: '🙏',
      title: 'Prayer Requests',
      description:
        'Submit and manage prayer requests with privacy controls for the congregation.',
    },
    {
      icon: '📖',
      title: 'Bible Studies',
      description:
        'Publish and discuss Bible study content with interactive comments.',
    },
    {
      icon: '👨‍👩‍👧‍👦',
      title: 'Groups & Ministries',
      description:
        'Organize members into groups with leader assignment and attendance tracking.',
    },
    {
      icon: '🔔',
      title: 'Notifications',
      description:
        'Stay updated with real-time notifications for comments and activities.',
    },
  ],
}

export const HOW_IT_WORKS = {
  badge: 'How It Works',
  title: 'Up and Running in Minutes',
  steps: [
    {
      step: '01',
      title: 'Create Account',
      description: 'Sign up with Google or email in seconds.',
    },
    {
      step: '02',
      title: 'Complete Profile',
      description: 'Fill in your member profile information.',
    },
    {
      step: '03',
      title: 'Start Managing',
      description: 'Access all features from your dashboard.',
    },
  ],
}

export const ABOUT = {
  badge: 'About',
  title: 'Designed for Real Churches',
  description:
    'ChurchMS was built to solve the everyday challenges churches face — keeping track of members, organizing events, and staying connected as a community. Whether you are a small congregation or a growing ministry, ChurchMS gives your admin team and members the tools they need.',
  audience: [
    { icon: '⭐', label: 'Church Administrators', desc: 'Full control over members, events, and content.' },
    { icon: '👤', label: 'Church Members', desc: 'View events, submit prayer requests, and stay connected.' },
    { icon: '👑', label: 'Group Leaders', desc: 'Manage your group, track attendance, and lead discussions.' },
  ],
}

export const CTA = {
  title: 'Ready to Get Started?',
  subtitle: 'Join your church community today. Free forever.',
  btn: 'Create Your Account →',
}

export const FOOTER = {
  copyright: `© ${new Date().getFullYear()} ChurchMS. Built with ❤️ for churches everywhere.`,
  links: [
    { label: 'Sign In', href: '/login' },
    { label: 'Sign Up', href: '/signup' },
  ],
}
