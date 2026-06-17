import { useState, type FormEvent } from 'react'
import { FaArrowTrendUp, FaEnvelope } from 'react-icons/fa6'
import { Link } from 'react-router-dom'

import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import { apiPost } from '../../services/api'
import { validateEmail } from '../../utils/validators'

import styles from './esqueci-senha.module.css'

type EsqueciSenhaPageProps = {
  isBackendConnected?: boolean
}

function EsqueciSenhaPage({ isBackendConnected }: EsqueciSenhaPageProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [formMessageType, setFormMessageType] = useState<'error' | 'success' | ''>('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setFormMessageType('error')
      setFormMessage('Informe seu e-mail.')
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setFormMessageType('error')
      setFormMessage('Por favor, insira um e-mail válido.')
      return
    }

    setIsSubmitting(true)
    setFormMessage('')
    setFormMessageType('')

    try {
      await apiPost('/auth/forgot-password', {
        email: trimmedEmail,
      })

      setFormMessageType('success')
      setFormMessage('Se o e-mail estiver cadastrado, enviaremos um link de recuperação.')
    } catch (error) {
      setFormMessageType('error')
      setFormMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao solicitar recuperação de senha.'
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
            <FaArrowTrendUp />
          </span>

          <span className={styles.brandName}>
            <span>Gap</span>
            <span className={styles.brandAccent}>Dev</span>
          </span>
        </div>

        <h1 className={styles.title}>
          Esqueci minha <span className={styles.brandAccent}>senha.</span>
        </h1>

        <p className={styles.description}>
          Informe seu e-mail para receber o link de recuperação.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
            label="E-mail"
            type="text"
            placeholder="seu@gmail.com"
            startIcon={<FaEnvelope />}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
          disabled={isSubmitting || !isBackendConnected}
        >
          {isSubmitting
            ? 'Enviando...'
            : !isBackendConnected
              ? 'Conectando ao servidor...'
              : 'Enviar link'}
        </Button>

        <p className={styles.backLink}>
          <Link to="/login">
             Voltar para login
          </Link>
        </p>
      </form>
    </section>
  </main>
    )
}

export default EsqueciSenhaPage