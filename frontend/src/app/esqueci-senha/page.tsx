import { useState, type FormEvent } from 'react'
import { FaArrowRight, FaChartLine, FaEnvelope, FaKey } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'

import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import { apiPost } from '../../services/api'
import { validateEmail } from '../../utils/validators'

import styles from './esqueci-senha.module.css'

function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [formMessageType, setFormMessageType] = useState<'error' | 'success' | ''>('')

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

    setIsSubmitting(true)
    setFormMessage('')
    setFormMessageType('')

    try {
      // Endpoint pode ser ajustado conforme o backend implementa a recuperação de senha.
      // A expectativa aqui é receber um status de envio/validação.
      await apiPost('/auth/forgot-password', { email: trimmedEmail })

      setFormMessageType('success')
      setFormMessage(
        'Se o e-mail existir na base, enviaremos instruções para redefinir sua senha.'
      )

      // Pequeno delay para o usuário ler a mensagem (sem bloqueios complexos)
      setTimeout(() => navigate('/login'), 1200)
    } catch (error) {
      setFormMessageType('error')
      setFormMessage(
        error instanceof Error ? error.message : 'Erro ao solicitar recuperação de senha.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <aside className={styles.infoPane}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <FaChartLine />
            </span>
            <span className={styles.brandName}>
              <span>Gap</span>
              <span className={styles.brandAccent}>Dev</span>
            </span>
          </div>

          <div className={styles.heroCopy}>
            <h1 className={styles.title}>
              Esqueci minha senha
              <span className={styles.titleLine}>
                e quero <strong className={styles.titleAccent}>redefinir</strong>.
              </span>
            </h1>
            <p className={styles.description}>
              Informe seu e-mail para receber instruções de recuperação.
            </p>
          </div>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon} aria-hidden="true">
                <FaEnvelope />
              </span>
              <div>
                <h2 className={styles.featureTitle}>Recuperação por e-mail</h2>
                <p className={styles.featureDescription}>
                  Enviaremos um link com orientações para redefinir sua senha.
                </p>
              </div>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon} aria-hidden="true">
                <FaKey />
              </span>
              <div>
                <h2 className={styles.featureTitle}>Rápido e seguro</h2>
                <p className={styles.featureDescription}>
                  Seu acesso continua protegido durante todo o processo.
                </p>
              </div>
            </li>
          </ul>
        </aside>

        <section className={styles.formPane}>
          <div className={styles.formCard}>
            <header className={styles.formHeader}>
              <h2 className={styles.formTitle}>Recuperar acesso</h2>
              <p className={styles.formSubtitle}>
                Digite seu e-mail. Vamos te ajudar a voltar.
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
                icon={<FaArrowRight />}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
              </Button>

              <p className={styles.footerText}>
                Lembrou a senha? <a href="/login">Voltar para o login</a>
              </p>
            </form>
          </div>
        </section>
      </section>
    </main>
  )
}

export default EsqueciSenhaPage

