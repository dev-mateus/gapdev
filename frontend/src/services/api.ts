import { API_URL } from '../config/env'

function buildUrl(path: string): string {
  const normalizedBase = API_URL.replace(/\/+$/, '')
  const normalizedPath = path.replace(/^\/+/, '')

  return `${normalizedBase}/${normalizedPath}`
}

function buildHeaders(extraHeaders?: HeadersInit): Headers {
  const headers = new Headers()

  if (extraHeaders) {
    new Headers(extraHeaders).forEach((value, key) => {
      headers.set(key, value)
    })
  }

  const token = localStorage.getItem('access_token')?.trim()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

function handleUnauthorized(path: string): void {
  if (path === '/auth/login') {
    return
  }

  localStorage.removeItem('access_token')
  localStorage.removeItem('usuarioLogado')
  localStorage.removeItem('usuarioEmail')

  window.dispatchEvent(new Event('auth-changed'))

  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

async function extractErrorMessage(response: Response): Promise<string> {
  let message = `HTTP ${response.status}`

  try {
    const data = await response.json()

    if (typeof data.detail === 'string') {
      return data.detail
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item: { msg?: string }) => item.msg)
        .filter(Boolean)
        .join(', ')
    }

    if (typeof data.message === 'string') {
      return data.message
    }

    switch (response.status) {
      case 400:
        return 'Requisição inválida.'

      case 401:
        return 'E-mail ou senha inválidos.'

      case 403:
        return 'Acesso negado.'

      case 404:
        return 'Recurso não encontrado.'

      case 422:
        return 'Dados inválidos. Verifique os campos.'

      case 500:
        return 'Erro interno do servidor.'

      default:
        return message
    }
  } catch {
    return message
  }
}

export async function apiGet<T>(
  path: string,
  headers?: HeadersInit
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'GET',
    headers: buildHeaders({
      Accept: 'application/json',
      ...headers,
    }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized(path)
    }

    const message = await extractErrorMessage(response)

    throw new Error(message)
  }

  return (await response.json()) as T
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  headers?: HeadersInit
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: buildHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    }),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized(path)
    }

    const message = await extractErrorMessage(response)

    throw new Error(message)
  }

  return (await response.json()) as T
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  headers?: HeadersInit
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'PATCH',
    headers: buildHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    }),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized(path)
    }

    const message = await extractErrorMessage(response)

    throw new Error(message)
  }

  return (await response.json()) as T
}