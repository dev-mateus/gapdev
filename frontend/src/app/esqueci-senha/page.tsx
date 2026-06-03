import { useState, type FormEvent } from 'react'
import { FaArrowLeftLong, FaEnvelope, FaLockOpen } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'

import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import { validateEmail } from '../../utils/validators'

import styles from './esqueci-senha.module.css'

type FormMessageType = 'error' | 'success' | ''

function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formMessageType, setFormMessageType] = useState<FormMessageType>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setFormMessageType('error')
      setFormMessage('Preencha seu e-mail.')
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setFormMessageType('error')
      setFormMessage('Por favor, insira um e-mail válido.')
      return
    }

    // UX: o backend ainda não possui rota de recuperação.
    // Mantemos o fluxo funcionando sem quebrar o front.
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))

      setFormMessageType('success')
      setFormMessage(
        'Enviaremos um link com as instruções para redefinir sua senha. Verifique sua caixa de entrada.'
      )
    } catch {
      setFormMessageType('error')
      setFormMessage('Não foi possível enviar o link de recuperação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate('/login')}
        >
          <span className={styles.backIcon} aria-hidden="true">
            <FaArrowLeftLong />
          </span>
          <span className={styles.backText}>Voltar para o login</span>
        </button>
      </header>

      <section className={styles.centerShell}>
        <div className={styles.card}>
          <div className={styles.iconWrap} aria-hidden="true">
            <FaLockOpen />
          </div>

          <h1 className={styles.title}>Recuperar senha</h1>

          <p className={styles.subtitle}>
            Insira o e-mail associado à sua conta e enviaremos um link com as instruções para redefinir sua senha.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              label="Seu e-mail cadastrado"
              type="text"
              placeholder="Seu e-mail cadastrado"
              startIcon={<FaEnvelope />}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {formMessage ? (
              <p
                className={`${styles.formMessage} ${
                  formMessageType === 'success'
                    ? styles.formMessageSuccess
                    : styles.formMessageError
                }`}
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
              Enviar link de recuperação
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default EsqueciSenhaPage

