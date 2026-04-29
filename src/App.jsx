import { BrowserRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Sidebar from './components/layout/Sidebar'
import Navbar from './components/layout/Navbar'
import AppRoutes from './routes/AppRoutes'

function AppLayout() {
  const location = useLocation()
  
  // Pages that don't need sidebar/navbar
  const authPages = ['/login', '/auth/callback', '/complete-profile', '/']
  const isAuthPage = authPages.includes(location.pathname) || location.pathname.startsWith('/auth/')

  if (isAuthPage) {
    return <AppRoutes />
  }

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar />
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
    minHeight: '100vh'
  },
  main: {
    marginLeft: '200px',
    flex: 1
  },
  content: {
    padding: '30px'
  }
}

export default App
