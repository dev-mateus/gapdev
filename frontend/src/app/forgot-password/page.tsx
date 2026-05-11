import { useState } from 'react'
import { FaArrowLeft, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'

import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import styles from './forgot-password.module.css'

function ForgotPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formMessage, setFormMessage] = useState('')
  const [formMessageType, setFormMessageType] = useState<'error' | 'success' | ''>('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  function passwordComplexityValidate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) errors.push('Mínimo 8 caracteres')
    if (!/[A-Z]/.test(password)) errors.push('Pelo menos 1 letra maiúscula')
    if (!/[0-9]/.test(password)) errors.push('Pelo menos 1 número')

    return { isValid: errors.length === 0, errors }
  }

  async function simulateApiCall(data: {
    newPassword: string
    confirmPassword: string
  }): Promise<{ ok: true }> {
    // Simulação (mantém comportamento local). Futuramente pode chamar API real.
    void data
    return { ok: true }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormMessage('')
    setFormMessageType('')

    if (!newPassword || !confirmPassword) {
      setFormMessageType('error')
      setFormMessage('Preencha a nova senha e confirmação.')
      return
    }

    if (newPassword !== confirmPassword) {
      setFormMessageType('error')
      setFormMessage('As senhas não coincidem.')
      return
    }

    const complexity = passwordComplexityValidate(newPassword)
    if (!complexity.isValid) {
      setFormMessageType('error')
      setFormMessage(`Senha inválida. Requisitos: ${complexity.errors.join(', ')}`)
      return
    }

    setIsLoading(true)

    simulateApiCall({ newPassword, confirmPassword })
      .then(() => {
        localStorage.setItem('novaSenhaDefinida', 'true')
        setFormMessageType('success')
        setFormMessage('Senha alterada com sucesso!')

        setNewPassword('')
        setConfirmPassword('')

        setTimeout(() => {
          navigate('/login')
        }, 600)
      })
      .catch(() => {
        setFormMessageType('error')
        setFormMessage('Não foi possível alterar a senha agora. Tente novamente mais tarde.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  function handleBackToLogin() {
    navigate('/login')
  }

  return (
    <main className={styles.page} style={{ minHeight: '100vh', display: 'block' }}>
      <section className={styles.shell}>
        <aside className={styles.infoPane}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <FaLock />
            </span>
            <span className={styles.brandName}>
              <span>Gap</span>
              <span className={styles.brandAccent}>Dev</span>
            </span>
          </div>

          <div className={styles.heroCopy}>
            <h1 className={styles.title}>
              <span className={styles.titleLine}>Recupere o acesso</span>
              <span className={styles.titleLine}>à sua conta.</span>
            </h1>
            <p className={styles.description}>
              Defina uma nova senha para continuar acessando sua jornada de aprendizado.
            </p>
          </div>
        </aside>

        <section className={styles.formPane}>
          <div className={styles.formCard}>
            <header className={styles.formHeader}>
              <button
                type="button"
                className={styles.backButton}
                onClick={handleBackToLogin}
                aria-label="Voltar para login"
              >
                <FaArrowLeft />
              </button>

              <h2 className={styles.formTitle}>Nova senha</h2>
              <p className={styles.formSubtitle}>Digite sua nova senha</p>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
              <Input
                label="Nova senha"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="********"
                startIcon={<FaLock />}
                endIcon={showNewPassword ? <FaEyeSlash /> : <FaEye />}
                endIconLabel={showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onEndIconClick={() => setShowNewPassword((current) => !current)}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewPassword(event.target.value)}
                required
              />

              <Input
                label="Confirmar nova senha"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="********"
                startIcon={<FaLock />}
                endIcon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                endIconLabel={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                onEndIconClick={() => setShowConfirmPassword((current) => !current)}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)}
                required
              />

              {formMessage && (
                <p
                  className={`${styles.formMessage} ${
                    formMessageType === 'success' ? styles.formMessageSuccess : styles.formMessageError
                  }`}
                  role="status"
                >
                  {formMessage}
                </p>
              )}

              <Button type="submit" variant="primary" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar nova senha'}
              </Button>

              <p className={styles.footerText}>
                Lembrou da senha?{' '}
                <button type="button" className={styles.linkButton} onClick={handleBackToLogin}>
                  Entrar
                </button>
              </p>
            </form>
          </div>
        </section>
      </section>
    </main>
  )
}

export default ForgotPasswordPage

