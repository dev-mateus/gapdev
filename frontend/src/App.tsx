import { type ReactElement, type ReactNode, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import CadastroPage from './app/cadastro/page'
import LoginPage from './app/login/page'
import VagasPage from './app/vagas/page'
import Sidebar from './components/Sidebar/Sidebar'
import HistoricoPage from './app/historico-vagas/page'
import './App.css'
import CookieBanner from './components/CookiesBanner/CookiesBanner'
import { useAuth } from './context/AuthContext'

function PrivateRoute({ children }: { children: ReactNode }) {
  const { estaAutenticado, estaCarregando } = useAuth()

  if (estaCarregando) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Verificando sessão...
      </div>
    )
  }

  if (!estaAutenticado) {
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
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />

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
                <VagasPage />
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
                <HistoricoPage />
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