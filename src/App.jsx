import { BrowserRouter } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Navbar from './components/layout/Navbar'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <Navbar />
          <div style={styles.content}>
            <AppRoutes />
          </div>
        </div>
      </div>
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
