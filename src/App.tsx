import { useEffect, useState } from 'react'
import CadastroPage from './app/cadastro/page'
import LoginPage from './app/login/page'

function getCurrentPath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path || '/'
}

function App() {
  const [path, setPath] = useState(getCurrentPath())

  useEffect(() => {
    const handleNavigation = () => setPath(getCurrentPath())

    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  }, [])

  if (path === '/cadastro') {
    return <CadastroPage />
  }

  return <LoginPage />
}

export default App
