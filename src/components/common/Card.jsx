function Card({ title, value, icon }) {
  return (
    <div style={styles.card}>
      <div style={styles.iconContainer}>
        <span style={styles.icon}>{icon}</span>
      </div>
      <div style={styles.content}>
        <p style={styles.title}>{title}</p>
        <h3 style={styles.value}>{value}</h3>
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  iconContainer: {
    width: '50px',
    height: '50px',
    backgroundColor: '#e0e7ff',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    fontSize: '24px'
  },
  content: {
    flex: 1
  },
  title: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280'
  },
  value: {
    margin: '5px 0 0 0',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937'
  }
}

export default Card
