function Table({ headers, children }) {
  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} style={styles.th}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

const styles = {
  wrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff'
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e5e7eb'
  }
}

export default Table
