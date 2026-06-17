import { useState, type FormEvent } from 'react'
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa6'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import { apiPost } from '../../services/api'
import { validatePassword } from '../../utils/validators'
import { FaChartLine } from 'react-icons/fa6'

import styles from '../esqueci-senha/esqueci-senha.module.css'

type ResetPasswordResponse = {
  message: string
}

function ResetarSenhaPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [formMessageType, setFormMessageType] = useState<'error' | 'success' | ''>('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      setFormMessageType('error')
      setFormMessage('Token de recuperação inválido ou ausente.')
      return
    }

    if (!newPassword || !confirmPassword) {
      setFormMessageType('error')
      setFormMessage('Preencha a nova senha e a confirmação.')
      return
    }

    if (newPassword !== confirmPassword) {
      setFormMessageType('error')
      setFormMessage('As senhas não conferem.')
      return
    }

    const passwordValidation = validatePassword(newPassword)

    if (!passwordValidation.isValid) {
      setFormMessageType('error')
      setFormMessage(`Senha inválida. Requisitos: ${passwordValidation.errors.join(', ')}`)
      return
    }

    setIsSubmitting(true)
    setFormMessage('')
    setFormMessageType('')

    try {
      const response = await apiPost<ResetPasswordResponse>('/auth/reset-password', {
        token,
        new_password: newPassword,
      })

      setFormMessageType('success')
      setFormMessage(response.message || 'Senha redefinida com sucesso.')

      setNewPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      setFormMessageType('error')
      setFormMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao redefinir senha.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
  <main className={styles.page}>
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            <FaChartLine  />
          </span>

          <span className={styles.brandName}>
            <span>Gap</span>
            <span className={styles.brandAccent}>Dev</span>
          </span>
        </div>

        <h1 className={styles.title}>
          Redefinir <span className={styles.brandAccent}>senha.</span>
        </h1>

        <p className={styles.description}>
          Informe sua nova senha para recuperar o acesso.
        </p>
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
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />

        <Input
          label="Confirmar nova senha"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="********"
          startIcon={<FaLock />}
          endIcon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          endIconLabel={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
          onEndIconClick={() => setShowConfirmPassword((current) => !current)}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        {formMessage ? (
          <p
            className={
              formMessageType === 'success'
                ? styles.successMessage
                : styles.errorMessage
            }
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {formMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
        </Button>

        <p className={styles.backLink}>
          <Link to="/login">Voltar para login</Link>
        </p>
      </form>
    </section>
  </main>
)
}

export default ResetarSenhaPage