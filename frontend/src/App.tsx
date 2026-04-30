import { type ReactElement, useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import CadastroPage from './app/cadastro/page'
import LoginPage from './app/login/page'
import Sidebar from './components/Sidebar/Sidebar'
import './App.css'
import CookieBanner from './components/CookiesBanner/CookiesBanner'
import { fetchBackendHealth } from './services/health'

function getCurrentPath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path || '/'
}

function navigateTo(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function App() {
  const [path, setPath] = useState(getCurrentPath())
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isBackendConnected, setIsBackendConnected] = useState(false)

  useEffect(() => {
    const handleNavigation = () => setPath(getCurrentPath())

    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  }, [])

  useEffect(() => {
    let isMounted = true

    const checkBackendConnection = async () => {
      try {
        const response = await fetchBackendHealth()
        if (isMounted && response.status === 'ok') {
          setIsBackendConnected(true)
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

  let page: ReactElement

  if (path === '/' || path === '/login') {
    page = <LoginPage isBackendConnected={isBackendConnected} onNavigate={navigateTo} />
  } else if (path === '/cadastro') {
    page = <CadastroPage isBackendConnected={isBackendConnected} onNavigate={navigateTo} />
  } else {
    page = (
      <div className="app-layout">
        {!isSidebarOpen && (
          <button className="menu-button" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        )}

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="app-content">
          <h1>Você está em: {path}</h1>
        </main>
      </div>
    )
  }

  return (
    <div>
      {page}
      <CookieBanner />
    </div>
  )
}

export default App
