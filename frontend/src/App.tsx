import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import CadastroPage from './app/cadastro/page'
import LoginPage from './app/login/page'
import Sidebar from './components/Sidebar/Sidebar'
import './App.css'

function getCurrentPath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path || '/'
}

function App() {
  const [path, setPath] = useState(getCurrentPath())
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const handleNavigation = () => setPath(getCurrentPath())

    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  }, [])

  if (path === '/' || path === '/login') {
    return <LoginPage />
  }

  if (path === '/cadastro') {
    return <CadastroPage />
  }

  return (
    <div className="app-layout">
      {/* ☰ aparece só quando a sidebar está fechada */}
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
        <h1>Você está em: {path}</h1>
      </main>
    </div>
  )
}

export default App

