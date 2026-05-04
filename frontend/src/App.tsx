import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
<<<<<<< HEAD
=======
import CadastroPage from './app/cadastro/page'
import LoginPage from './app/login/page'
import VagasPage from './app/vagas/page'
>>>>>>> 8a9e895b0b9939394d516ba9db1f79b598e3f6f0
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

<<<<<<< HEAD
  if (!CurrentPage) {
    return (
      <>
        <main className="app-not-found">
          <h1>Página não encontrada</h1>
=======
  if (path === '/' || path === '/login') {
    page = <LoginPage isBackendConnected={isBackendConnected} />
  } else if (path === '/cadastro') {
    page = <CadastroPage isBackendConnected={isBackendConnected} />
  } else if (path === '/vagas') {
    page = <VagasPage />
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
>>>>>>> 8a9e895b0b9939394d516ba9db1f79b598e3f6f0
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