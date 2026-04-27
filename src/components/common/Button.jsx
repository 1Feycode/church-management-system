function Button({ children, onClick, variant = 'primary', type = 'button' }) {
  const variantStyles = {
    primary: { backgroundColor: '#4f46e5', color: '#fff' },
    danger: { backgroundColor: '#ef4444', color: '#fff' },
    secondary: { backgroundColor: '#6b7280', color: '#fff' },
    outline: { backgroundColor: 'transparent', color: '#4f46e5', border: '1px solid #4f46e5' }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      style={{ ...styles.base, ...variantStyles[variant] }}
    >
      {children}
    </button>
  )
}

const styles = {
  base: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
}

export default Button
