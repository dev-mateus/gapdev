import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar/Sidebar'
import CookieBanner from './components/CookiesBanner/CookiesBanner'
import { ROUTES } from './constants/routes'
import { fetchBackendHealth } from './services/health'
import './App.css'

function getCurrentPath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path || '/'
}

const PUBLIC_ROUTES = ['/', '/login', '/cadastro']

function App() {
  const [path, setPath] = useState(getCurrentPath())
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isBackendConnected, setIsBackendConnected] = useState(false)

  useEffect(() => {
    const handleNavigation = () => setPath(getCurrentPath())

    window.addEventListener('popstate', handleNavigation)

    return () => {
      window.removeEventListener('popstate', handleNavigation)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const checkBackendConnection = async () => {
      try {
        const response = await fetchBackendHealth()

        if (isMounted) {
          setIsBackendConnected(response.status === 'ok')
        }
      } catch {
        if (isMounted) {
          setIsBackendConnected(false)
        }
      }
    }

    void checkBackendConnection()

    return () => {
      isMounted = false
    }
  }, [])

  const CurrentPage = ROUTES[path]
  const isPublicRoute = PUBLIC_ROUTES.includes(path)

  if (!CurrentPage) {
    return (
      <>
        <main className="app-not-found">
          <h1>Página não encontrada</h1>
        </main>
        <CookieBanner />
      </>
    )
  }

  const page = isPublicRoute ? (
    <CurrentPage isBackendConnected={isBackendConnected} />
  ) : (
    <div className="app-layout">
      {!isSidebarOpen && (
        <button
          className="menu-button"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="app-content">
        <CurrentPage />
      </main>
    </div>
  )

  return (
    <>
      {page}
      <CookieBanner />
    </>
  )
}

export default App