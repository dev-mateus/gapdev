import { type ReactElement, type ReactNode, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Perfil from './app/Perfil/perfil'
import CadastroPage from './app/cadastro/page'
import LoginPage from './app/login/page'
import VagasPage from './app/vagas/page'
import PlanoEstudosPage from './app/plano-estudos/page'
import Sidebar from './components/Sidebar/Sidebar'
import HistoricoPage from './app/historico-vagas/page'
import ProgressoPage from './app/progresso/page'
import { StudyPlanProvider } from './contexts/StudyPlanContext'

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <main className={`app-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>{children}</main>
    </div>
  )
}

function App(): ReactElement {
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
    <StudyPlanProvider>
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
                <Perfil />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        

        <Route
          path="/vagas"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <VagasPage />
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/plano-estudos"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <PlanoEstudosPage />
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
          path="/progresso"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <ProgressoPage />
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/historico-vagas"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <HistoricoPage />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
      </Routes>

      <CookieBanner />
    </>
    </StudyPlanProvider>
  )
}

export default App