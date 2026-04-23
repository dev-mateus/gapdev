import { useId, useState } from 'react'
import type {
  ButtonHTMLAttributes,
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
} from 'react'
import styles from './login.module.css'

type InputProps = {
  label: string
  type: 'text' | 'password'
  placeholder: string
  startIcon?: ReactNode
  endIcon?: ReactNode
  endIconLabel?: string
  onEndIconClick?: () => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'placeholder'>

type ButtonProps = {
  variant: 'primary' | 'secondary'
  icon?: ReactNode
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

type CheckboxProps = {
  label: string
  checked?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4 6.75h16A1.75 1.75 0 0 1 21.75 8.5v7A1.75 1.75 0 0 1 20 17.25H4A1.75 1.75 0 0 1 2.25 15.5v-7A1.75 1.75 0 0 1 4 6.75Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m3.5 8 8.5 6.25L20.5 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M7.5 10.25V8a4.5 4.5 0 1 1 9 0v2.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect
        x="5.5"
        y="10.25"
        width="13"
        height="10"
        rx="2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M2.5 12s3.4-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.4 6.5-9.5 6.5S2.5 12 2.5 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4 4 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.2 5.1A9.6 9.6 0 0 1 12 4.8c6.1 0 9.5 7.2 9.5 7.2a17.5 17.5 0 0 1-4.1 4.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6.1 7.4C3.8 9.2 2.5 12 2.5 12s3.4 7.2 9.5 7.2c1 0 2-.2 2.9-.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M21.35 12.2c0-.67-.06-1.31-.17-1.94H12v3.67h5.23a4.48 4.48 0 0 1-1.94 2.94v2.44h3.13c1.83-1.68 2.93-4.16 2.93-7.11Z" />
      <path fill="#34A853" d="M12 22c2.61 0 4.8-.86 6.4-2.33l-3.13-2.44c-.87.58-1.98.92-3.27.92a5.7 5.7 0 0 1-5.36-3.94H3.41v2.55A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.64 14.21a5.94 5.94 0 0 1 0-4.42V7.24H3.41a10.02 10.02 0 0 0 0 9.52l3.23-2.55Z" />
      <path fill="#EA4335" d="M12 5.38a5.4 5.4 0 0 1 3.82 1.49l2.86-2.86A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.59 5.24l3.23 2.55A5.7 5.7 0 0 1 12 5.38Z" />
    </svg>
  )
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4.5 19.5h15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="6" y="12" width="2.6" height="6" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.7" y="8.5" width="2.6" height="9.5" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15.4" y="5.5" width="2.6" height="12.5" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function StudyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4.8 6.3a15 15 0 0 1 5.2-1.4c2.2 0 3.9.7 5 1.2v11.8c-1.1-.5-2.8-1.2-5-1.2a15 15 0 0 0-5.2 1.4V6.3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M18.9 6.3a15 15 0 0 0-5.2-1.4c-1.4 0-2.6.2-3.6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M12 5.4v12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ProgressIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 19.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7.5 16v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 16V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16.5 16V6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7.5 10.5l4.5-2.8 4.5-1.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BrandIcon() {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      <rect x="2.5" y="2.5" width="31" height="31" rx="8" fill="#173b73" stroke="rgba(113, 205, 255, 0.4)" />
      <path d="M9 25V11" stroke="#6ee7ff" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 25h18" stroke="#6ee7ff" strokeWidth="2" strokeLinecap="round" />
      <path d="M12.5 23v-4.5" stroke="#6ee7ff" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 23v-8" stroke="#6ee7ff" strokeWidth="2" strokeLinecap="round" />
      <path d="M21.5 23v-6" stroke="#6ee7ff" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 15.5 16.6 12l4.1 2.8 5.7-6" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25.5 8.8h1.8v1.8" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Input({
  label,
  placeholder,
  startIcon,
  endIcon,
  endIconLabel,
  onEndIconClick,
  type,
  className,
  ...inputProps
}: InputProps) {
  const id = useId()

  return (
    <label className={`${styles.field} ${className ?? ''}`} htmlFor={id}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.inputShell}>
        {startIcon ? <span className={styles.inputIcon}>{startIcon}</span> : null}
        <input
          id={id}
          className={styles.input}
          type={type}
          placeholder={placeholder}
          {...inputProps}
        />
        {endIcon ? (
          onEndIconClick ? (
            <button
              type="button"
              className={styles.iconButton}
              onClick={onEndIconClick}
              aria-label={endIconLabel}
            >
              {endIcon}
            </button>
          ) : (
            <span className={styles.inputIcon}>{endIcon}</span>
          )
        ) : null}
      </span>
    </label>
  )
}

function Button({ variant, icon, className, children, ...buttonProps }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${variant === 'primary' ? styles.primaryButton : styles.secondaryButton} ${className ?? ''}`}
      {...buttonProps}
    >
      {icon ? <span className={styles.buttonIcon}>{icon}</span> : null}
      <span>{children}</span>
    </button>
  )
}

function Checkbox({ label, checked, onChange }: CheckboxProps) {
  const id = useId()

  return (
    <label className={styles.checkbox} htmlFor={id}>
      <input id={id} className={styles.checkboxInput} type="checkbox" checked={checked} onChange={onChange} />
      <span className={styles.checkboxBox} aria-hidden="true" />
      <span className={styles.checkboxLabel}>{label}</span>
    </label>
  )
}

const features = [
  {
    title: 'Análises inteligentes',
    description: 'Dados atualizados do mercado de tecnologia',
    icon: AnalyticsIcon,
  },
  {
    title: 'Planos personalizados',
    description: 'Estudos alinhados com suas metas profissionais',
    icon: StudyIcon,
  },
  {
    title: 'Acompanhe seu progresso',
    description: 'Evolução contínua com métricas claras',
    icon: ProgressIcon,
  },
] as const

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <aside className={styles.infoPane}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <BrandIcon />
            </span>
            <span className={styles.brandName}>GapDev</span>
          </div>

          <div className={styles.heroCopy}>
            <h1 className={styles.title}>
              Evolua suas habilidades.
              <span>
                Acelere sua <strong>carreira</strong>.
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

            <form className={styles.form}>
              <Input
                label="E-mail"
                type="text"
                placeholder="seu@gmail.com"
                startIcon={<MailIcon />}
                autoComplete="email"
              />

              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                startIcon={<LockIcon />}
                endIcon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
                endIconLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onEndIconClick={() => setShowPassword((current) => !current)}
                autoComplete="current-password"
              />

              <div className={styles.formRow}>
                <Checkbox label="Lembra de mim" />
                <a className={styles.inlineLink} href="#forgot-password">
                  Esqueci minha senha
                </a>
              </div>

              <Button type="submit" variant="primary" className={styles.submitButton}>
                Entrar
              </Button>

              <div className={styles.divider}>
                <span />
                <span>ou continue com</span>
                <span />
              </div>

              <Button type="button" variant="secondary" icon={<GoogleIcon />} className={styles.googleButton}>
                Entrar com Google
              </Button>

              <p className={styles.footerText}>
                Ainda não tem uma conta? <a href="#signup">Cadastra-se</a>
              </p>
            </form>
          </div>
        </section>
      </section>
    </main>
  )
}

export { Button, Checkbox, Input }
export default LoginPage