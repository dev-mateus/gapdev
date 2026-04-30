import { useState } from 'react'
import {
  FaArrowTrendUp,
  FaBookOpen,
  FaChartLine,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaLock,
} from 'react-icons/fa6'
import Button from '../../components/Button/Button'
import Checkbox from '../../components/Checkbox/Checkbox'
import Input from '../../components/Input/Input'
import styles from './cadastro.module.css'

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

function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [errors, setErrors] = useState<{ nome?: string; email?: string; password?: string; confirmPassword?: string; agreeTerms?: string }>({})

const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    //_PASSWORD_VALIDATION: Minimum 6 characters (6-8 recommended for security)
    return password.length >= 6
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { nome?: string; email?: string; password?: string; confirmPassword?: string } = {}

    if (!nome.trim()) {
      newErrors.nome = 'Coloque seu nome'
    }

    if (!email.trim()) {
      newErrors.email = 'Coloque seu e-mail'
    } else if (!validateEmail(email)) {
      newErrors.email = 'E-mail inválido. Use o formato: nome@email.com'
    }

if (!password.trim()) {
      newErrors.password = 'Coloque sua senha'
    } else if (!validatePassword(password)) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres (máximo 8)'
    }

if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirme sua senha'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não conferem'
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'Você precisa concordar com os termos para criar uma conta'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      console.log('Cadastro submitted:', { nome, email, password })
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
              <span className={styles.titleLine}>Construa sua</span>
              <span className={styles.titleLine}>
                <strong className={styles.titleAccent}>carreira</strong> com estratégia.
              </span>
            </h1>
            <p className={styles.description}>
              Crie sua conta e receba um plano de estudos baseado no mercado real.
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
              <h2 className={styles.formTitle}>Crie sua conta</h2>
              <p className={styles.formSubtitle}>Comece sua jornada agora</p>
            </header>

<form className={styles.form} onSubmit={handleSubmit}>
              <Input 
                label="Nome" 
                type="text" 
                placeholder="nome" 
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                error={errors.nome}
              />

              <Input
                label="E-mail"
                type="text"
                placeholder="seu@gmail.com"
                startIcon={<FaEnvelope />}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />

              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="**********"
                startIcon={<FaLock />}
                endIcon={showPassword ? <FaEyeSlash /> : <FaEye />}
                endIconLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onEndIconClick={() => setShowPassword((current) => !current)}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />

              <Input
                label="Confirmar Senha"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="**********"
                startIcon={<FaLock />}
                endIcon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                endIconLabel={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                onEndIconClick={() => setShowConfirmPassword((current) => !current)}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
              />

<Checkbox 
                label="Eu concordo com os termos" 
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                error={errors.agreeTerms}
              />

              <Button type="submit" variant="primary" className={styles.submitButton}>
                Criar conta
              </Button>

              <div className={styles.divider}>
                <span />
                <span>ou continue com</span>
                <span />
              </div>

              <Button type="button" variant="secondary" icon={<FaGoogle />} className={styles.googleButton}>
                Entrar com Google
              </Button>

              <p className={styles.footerText}>
                Já tem uma conta? <a href="/login">Entrar</a>
              </p>
            </form>
          </div>
        </section>
      </section>
    </main>
  )
}

export default CadastroPage
