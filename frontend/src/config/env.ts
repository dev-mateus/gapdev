const DEFAULT_API_URL = 'https://gapdev.onrender.com/'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

export const API_URL = configuredApiUrl && configuredApiUrl.length > 0 ? configuredApiUrl : DEFAULT_API_URL
