import { useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Sidebar from './components/layout/Sidebar'
import Navbar from './components/layout/Navbar'
import AppRoutes from './routes/AppRoutes'
import { useResponsive } from './hooks/useResponsive'

function AppLayout() {
  const location = useLocation()
  const { isSmall } = useResponsive()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Pages that don't need sidebar/navbar
  const authPages = ['/login', '/auth/callback', '/complete-profile', '/']
  const isAuthPage = authPages.includes(location.pathname) || location.pathname.startsWith('/auth/')

  if (isAuthPage) {
    return <AppRoutes />
  }

  return (
    <div style={styles.container}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div style={{
        ...styles.main,
        marginLeft: isSmall ? 0 : '220px'
      }}>
        <Navbar onMenuToggle={() => setSidebarOpen(v => !v)} />
        <div style={styles.content}>
          <AppRoutes />
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  )
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: '100vh'
  },
  content: {
    padding: '20px',
    flex: 1
  }
}

export default App
