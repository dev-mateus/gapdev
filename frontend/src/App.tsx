import { useEffect, useState } from 'react'
import CadastroPage from './app/cadastro/page'
import LoginPage from './app/login/page'
import { fetchBackendHealth } from './services/health'

function getCurrentPath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path || '/'
}

function App() {
  const [path, setPath] = useState(getCurrentPath())
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

  if (path === '/cadastro') {
    return <CadastroPage isBackendConnected={isBackendConnected} />
  }

  return <LoginPage isBackendConnected={isBackendConnected} />
}

export default App
