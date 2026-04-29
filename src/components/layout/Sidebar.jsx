import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h2 style={styles.title}>Church System</h2>
      <nav style={styles.nav}>
        <NavLink to="/dashboard" style={styles.link} end>
          {({ isActive }) => (
            <span style={isActive ? styles.activeLink : styles.link}>Dashboard</span>
          )}
        </NavLink>
        <NavLink to="/members" style={styles.link}>
          {({ isActive }) => (
            <span style={isActive ? styles.activeLink : styles.link}>Members</span>
          )}
        </NavLink>
        <NavLink to="/groups" style={styles.link}>
          {({ isActive }) => (
            <span style={isActive ? styles.activeLink : styles.link}>Groups</span>
          )}
        </NavLink>
        <NavLink to="/events" style={styles.link}>
          {({ isActive }) => (
            <span style={isActive ? styles.activeLink : styles.link}>Events</span>
          )}
        </NavLink>
        <NavLink to="/prayer-requests" style={styles.link}>
          {({ isActive }) => (
            <span style={isActive ? styles.activeLink : styles.link}>Prayer Requests</span>
          )}
        </NavLink>
        <NavLink to="/bible-studies" style={styles.link}>
          {({ isActive }) => (
            <span style={isActive ? styles.activeLink : styles.link}>Bible Studies</span>
          )}
        </NavLink>
        <NavLink to="/announcements" style={styles.link}>
          {({ isActive }) => (
            <span style={isActive ? styles.activeLink : styles.link}>Announcements</span>
          )}
        </NavLink>
      </nav>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '200px',
    height: '100vh',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    padding: '20px',
    position: 'fixed',
    left: 0,
    top: 0
  },
  title: {
    marginBottom: '30px',
    textAlign: 'center'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  link: {
    color: '#a0a0a0',
    textDecoration: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    transition: 'all 0.2s'
  },
  activeLink: {
    color: '#fff',
    backgroundColor: '#0f3460',
    textDecoration: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    fontWeight: 'bold'
  }
}

export default Sidebar
