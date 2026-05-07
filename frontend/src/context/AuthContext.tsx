import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { setAccessToken } from '../services/api'
import { loginApi, logoutApi, refreshApi, type Usuario } from '../services/authService'

interface AuthContextType {
  usuario: Usuario | null
  estaCarregando: boolean
  estaAutenticado: boolean
  fazerLogin: (email: string, senha: string, rememberMe: boolean) => Promise<void>
  fazerLogout: () => Promise<void>
  verificarAutenticacao: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [estaCarregando, setEstaCarregando] = useState(true)

  const verificarAutenticacao = useCallback(async () => {
    setEstaCarregando(true)
    try {
      const data = await refreshApi()
      setAccessToken(data.accessToken)
      setUsuario(data.usuario)
    } catch {
      setAccessToken(null)
      setUsuario(null)
    } finally {
      setEstaCarregando(false)
    }
  }, [])

  // Tenta restaurar sessão ao montar o app
  useEffect(() => {
    void verificarAutenticacao()
  }, [verificarAutenticacao])

  const fazerLogin = useCallback(
    async (email: string, senha: string, rememberMe: boolean) => {
      const data = await loginApi(email, senha, rememberMe)
      setAccessToken(data.accessToken)
      setUsuario(data.usuario)
    },
    [],
  )

  const fazerLogout = useCallback(async () => {
    await logoutApi()
    setAccessToken(null)
    setUsuario(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        usuario,
        estaCarregando,
        estaAutenticado: usuario !== null,
        fazerLogin,
        fazerLogout,
        verificarAutenticacao,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}