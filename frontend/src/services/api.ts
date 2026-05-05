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

  const userEmail = localStorage.getItem('usuarioEmail')?.trim()

  if (userEmail) {
    headers.set('X-User-Email', userEmail)
  }

  return headers
}

export async function apiGet<T>(path: string, headers?: HeadersInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'GET',
    headers: buildHeaders({ Accept: 'application/json', ...headers }),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return (await response.json()) as T
}

export async function apiPost<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: buildHeaders({ Accept: 'application/json', 'Content-Type': 'application/json', ...headers }),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`

    try {
      const data = (await response.json()) as { detail?: string }
      if (typeof data.detail === 'string' && data.detail.trim().length > 0) {
        message = data.detail
      }
    } catch {
      // Keep the generic HTTP status message when the body is not JSON.
    }

    throw new Error(message)
  }

  return (await response.json()) as T
}
