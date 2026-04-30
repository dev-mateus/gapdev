import { type ReactElement, type ReactNode, useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { Routes, Route, Navigate } from 'react-router-dom'
import CadastroPage from './app/cadastro/page'
import LoginPage from './app/login/page'
import Sidebar from './components/Sidebar/Sidebar'
import './App.css'
import CookieBanner from './components/CookiesBanner/CookiesBanner'
import { fetchBackendHealth } from './services/health'

function PrivateRoute({ children }: { children: ReactNode }) {
  const isLogged = localStorage.getItem('usuarioLogado')

  if (!isLogged) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PrivateLayout({ children }: { children: ReactElement }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="app-layout">
      {!isSidebarOpen && (
        <button className="menu-button" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="app-content">{children}</main>
    </div>
  )
}

function App() {
  const [isBackendConnected, setIsBackendConnected] = useState(false)

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

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<LoginPage isBackendConnected={isBackendConnected} />}
        />

        <Route
          path="/login"
          element={<LoginPage isBackendConnected={isBackendConnected} />}
        />

        <Route
          path="/cadastro"
          element={<CadastroPage isBackendConnected={isBackendConnected} />}
        />

        {/* 🔒 ROTAS PROTEGIDAS */}

        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <h1>Você está em: /perfil</h1>
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/vagas"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <h1>Você está em: /vagas</h1>
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/analise"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <h1>Você está em: /analise</h1>
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/plano-estudos"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <h1>Você está em: /plano-estudos</h1>
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/progresso"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <h1>Você está em: /progresso</h1>
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/historico-vagas"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <h1>Você está em: /historico-vagas</h1>
              </PrivateLayout>
            </PrivateRoute>
          }
        />
      </Routes>

      <CookieBanner />
    </>
  )
}

export default App