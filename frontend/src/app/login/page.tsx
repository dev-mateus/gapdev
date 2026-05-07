import { useState } from 'react'
import { FaArrowTrendUp, FaBookOpen, FaChartLine, FaEnvelope, FaEye, FaEyeSlash, FaGoogle, FaLock } from 'react-icons/fa6'
import Button from '../../components/Button/Button'
import Checkbox from '../../components/Checkbox/Checkbox'
import Input from '../../components/Input/Input'
import { validateEmail, validatePassword } from '../../utils/validators'
import styles from './login.module.css'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

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

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [formMessageType, setFormMessageType] = useState<'error' | 'success' | ''>('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { fazerLogin } = useAuth()

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token

        if (!accessToken) {
          throw new Error('Não foi possível recuperar o token do Google.')
        }

        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!response.ok) {
          throw new Error('Não foi possível obter seu e-mail do Google.')
        }

        const profile = (await response.json()) as { email?: string }

        if (profile.email) {
          // TODO: quando o backend tiver rota de login com Google,
          // chamar fazerLogin com as credenciais OAuth aqui.
          // Por ora mantém o fluxo anterior.
          await fazerLogin(profile.email, '', rememberMe)
        }

        navigate('/vagas')
      } catch (error) {
        setFormMessageType('error')
        setFormMessage(error instanceof Error ? error.message : 'Erro ao fazer login com Google.')
      }
    },
    onError: () => {
      setFormMessageType('error')
      setFormMessage('Erro ao fazer login com Google.')
    },
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

    setIsLoading(true)
    setFormMessage('')

    try {
      await fazerLogin(trimmedEmail, password, rememberMe)
      navigate('/vagas')
    } catch (error) {
      setFormMessageType('error')
      setFormMessage(error instanceof Error ? error.message : 'Erro ao fazer login.')
    } finally {
      setIsLoading(false)
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
              <p className={styles.formSubtitle}>Faça login para continuar sua jornada</p>
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
                <Checkbox
                  label="Lembrar de mim por 30 dias"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <a className={styles.inlineLink} href="#forgot-password">
                  Esqueci minha senha
                </a>
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

              <Button type="submit" variant="primary" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <div className={styles.divider}>
                <span />
                <span>ou continue com</span>
                <span />
              </div>

              <Button
                type="button"
                variant="secondary"
                icon={<FaGoogle />}
                className={styles.googleButton}
                onClick={() => loginWithGoogle()}
              >
                Entrar com Google
              </Button>

              <p className={styles.footerText}>
                Ainda não tem uma conta? <a href="/cadastro">Cadastre-se</a>
              </p>
            </form>
          </div>
        </section>
      </section>
    </main>
  )
}

export default LoginPage