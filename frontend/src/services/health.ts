import { apiGet } from './api'

type HealthResponse = {
  status: string
  message: string
}

export async function fetchBackendHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>('health')
}
