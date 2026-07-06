import { useState, type FormEvent } from 'react'
import {
  FaArrowTrendUp,
  FaBookOpen,
  FaChartLine,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
} from 'react-icons/fa6'

import { Link, useNavigate } from 'react-router-dom'

import Button from '../../components/Button/Button'
import GoogleButton from '../../components/GoogleButton/GoogleButton'
import Input from '../../components/Input/Input'
import { apiPost } from '../../services/api'
import { validateEmail, validatePassword } from '../../utils/validators'

import styles from './login.module.css'


const features = [
  {
    title: 'Análises inteligentes',
    description: 'Dados atualizados do mercado de tecnologia',
    icon: FaChartLine,
  },
  {
    title: 'Planos personalizados',
    description: 'Estudos alinhados com suas metas profissionais',
    icon: FaBookOpen,
  },
  {
    title: 'Acompanhe seu progresso',
    description: 'Evolução contínua com métricas claras',
    icon: FaArrowTrendUp,
  },
] as const

type LoginPageProps = {
  isBackendConnected?: boolean
}

type LoginResponse = {
  access_token: string
  token_type: string
}

function LoginPage({ isBackendConnected }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formMessageType, setFormMessageType] = useState<'error' | 'success' | ''>('')

  const navigate = useNavigate()

  async function handleGoogleSuccess(googleToken: string) {
    try {
      if (!googleToken) {
        throw new Error('Nao foi possivel recuperar o token do Google.')
      }

      const data = await apiPost<LoginResponse>('/auth/google', {
        google_token: googleToken,
      })

      localStorage.setItem('access_token', data.access_token)

      localStorage.setItem(
        'usuarioLogado',
        JSON.stringify({
          email: '',
          nome: '',
          authProvider: 'google',
        })
      )

      localStorage.removeItem('usuarioEmail')
      window.dispatchEvent(new Event('auth-changed'))

      setFormMessageType('success')
      setFormMessage('Login realizado com sucesso.')

      navigate('/perfil')
    } catch (error) {
      setFormMessageType('error')
      setFormMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao fazer login com Google.'
      )
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      setFormMessageType('error')
      setFormMessage('Preencha e-mail e senha.')
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setFormMessageType('error')
      setFormMessage('Por favor, insira um e-mail válido.')
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setFormMessageType('error')
      setFormMessage(`Senha inválida. Requisitos: ${passwordValidation.errors.join(', ')}`)
      return
    }

    setIsSubmitting(true)
    setFormMessage('')
    setFormMessageType('')

    try {
      const data = await apiPost<LoginResponse>('/auth/login', {
        email: trimmedEmail,
        password,
      })

      localStorage.setItem('access_token', data.access_token)

      const usuarioCadastrado = localStorage.getItem(`usuario_${trimmedEmail}`)
      const usuario = usuarioCadastrado ? JSON.parse(usuarioCadastrado) : null

      localStorage.setItem(
        'usuarioLogado',
        JSON.stringify({
          nome: usuario?.nome || '',
          email: trimmedEmail,
        })
      )

      localStorage.removeItem('usuarioEmail')
      window.dispatchEvent(new Event('auth-changed'))
      navigate('/perfil')
    } catch (error) {
      setFormMessageType('error')
      setFormMessage(error instanceof Error ? error.message : 'Erro ao fazer login.')
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
              <span className={styles.titleLine}>Evolua suas habilidades.</span>
              <span className={styles.titleLine}>
                Acelere sua <strong className={styles.titleAccent}>carreira</strong>.
              </span>
            </h1>
            <p className={styles.description}>
              Analisamos vagas do mercado e criamos um plano de estudos personalizados para você conquistar seus objetivos
            </p>
          </div>

          <ul className={styles.featureList}>
            {features.map(({ title, description, icon: Icon }) => (
              <li key={title} className={styles.featureItem}>
                <span className={styles.featureIcon} aria-hidden="true">
                  <Icon />
                </span>
                <div>
                  <h2 className={styles.featureTitle}>{title}</h2>
                  <p className={styles.featureDescription}>{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <section className={styles.formPane}>
          <div className={styles.formCard}>
            <header className={styles.formHeader}>
              <h2 className={styles.formTitle}>Bem-vindo de volta!</h2>
              <p className={styles.formSubtitle}>
                Faça login para continuar sua jornada
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

              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                startIcon={<FaLock />}
                endIcon={showPassword ? <FaEyeSlash /> : <FaEye />}
                endIconLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onEndIconClick={() => setShowPassword((current) => !current)}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <div className={styles.formRow}>
                <Link className={styles.inlineLink} to="/esqueci-senha">
                  Esqueci minha senha
                </Link>
              </div>

              {formMessage ? (
                <p
                  className={`${styles.formMessage} ${formMessageType === 'success' ? styles.formMessageSuccess : styles.formMessageError}`}
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
                  ? 'Entrando...'
                  : !isBackendConnected
                    ? 'Conectando ao servidor...'
                    : 'Entrar'}
              </Button>

              <div className={styles.divider}>
                <span />
                <span>ou continue com</span>
                <span />
              </div>

              <GoogleButton
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setFormMessageType('error')
                  setFormMessage('Erro ao autenticar com Google.')
                }}
                disabled={!isBackendConnected}
              >
                {isBackendConnected ? 'Entrar com Google' : 'Aguarde...'}
              </GoogleButton>

              <p className={styles.footerText}>
                Ainda não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
              </p>
            </form>
          </div>
        </section>
      </section>
    </main>
  )
}

export default LoginPage