const DEFAULT_API_URL = 'http://localhost:8000'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

export const API_URL = configuredApiUrl && configuredApiUrl.length > 0 ? configuredApiUrl : DEFAULT_API_URL
