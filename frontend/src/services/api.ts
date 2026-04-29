import { API_URL } from '../config/env'

function buildUrl(path: string): string {
  const normalizedBase = API_URL.replace(/\/+$/, '')
  const normalizedPath = path.replace(/^\/+/, '')
  return `${normalizedBase}/${normalizedPath}`
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return (await response.json()) as T
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
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
