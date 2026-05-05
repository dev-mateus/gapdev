/**
 * Valida se o email possui um formato correto
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida se a senha atende aos requisitos:
 * - Mínimo 6 caracteres
 * - Pelo menos 1 letra (a-z ou A-Z)
 * - Pelo menos 1 número (0-9)
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 6) {
    errors.push('Mínimo 6 caracteres')
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Pelo menos 1 letra')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Pelo menos 1 número')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Retorna uma mensagem amigável sobre os requisitos da senha
 */
export function getPasswordRequirements(password: string): string {
  const validation = validatePassword(password)
  if (validation.isValid) return ''
  return `Senha deve conter: ${validation.errors.join(', ')}`
}
