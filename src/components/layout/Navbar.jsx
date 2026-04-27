function Navbar() {
  return (
    <div style={styles.navbar}>
      <h2>Church System</h2>
      <div style={styles.userPlaceholder}>
        <span>User Info</span>
      </div>
    </div>
  )
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: '#16213e',
    color: '#fff',
    height: '60px'
  },
  userPlaceholder: {
    padding: '5px 15px',
    backgroundColor: '#0f3460',
    borderRadius: '20px'
  }
}

export default Navbar
