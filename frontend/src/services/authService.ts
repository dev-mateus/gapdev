import { API_URL } from '../config/env'

export interface Usuario {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  usuario: Usuario
}

const BASE = API_URL.replace(/\/+$/, '')

export async function loginApi(
  email: string,
  password: string,
  rememberMe: boolean,
): Promise<AuthResponse> {
  const response = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // envia e recebe o cookie httpOnly
    body: JSON.stringify({ email, password, rememberMe }),
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { detail?: string }
    throw new Error(data.detail ?? `HTTP ${response.status}`)
  }

  return response.json() as Promise<AuthResponse>
}

export async function refreshApi(): Promise<AuthResponse> {
  const response = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // cookie é enviado automaticamente
  })

  if (!response.ok) {
    throw new Error('refresh_failed')
  }

  return response.json() as Promise<AuthResponse>
}

export async function logoutApi(): Promise<void> {
  await fetch(`${BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  // ignora erros — o logout local acontece de qualquer forma
}