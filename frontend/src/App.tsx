import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import CadastroPage from './app/cadastro/page'
import LoginPage from './app/login/page'
import Sidebar from './components/Sidebar/Sidebar'
import './App.css'
import CookieBanner from "./components/CookiesBanner/CookiesBanner";
import { fetchBackendHealth } from './services/health'

function getCurrentPath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path || '/'
}

function App() {
  const [path, setPath] = useState(getCurrentPath())
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isBackendConnected, setIsBackendConnected] = useState(false)

  useEffect(() => {
    const handleNavigation = () => setPath(getCurrentPath());

    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  let page;

  if (path === "/cadastro") {
    page = <CadastroPage />;
  } else {
    page = <LoginPage />;
  }

  return (
    <div>
      {page}
      <CookieBanner />
    </div>
  );
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

  if (path === '/' || path === '/login') {
    return <LoginPage />
  }

  if (path === '/cadastro') {
    return <CadastroPage isBackendConnected={isBackendConnected} />
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

  return <LoginPage isBackendConnected={isBackendConnected} />
}

export default App;
