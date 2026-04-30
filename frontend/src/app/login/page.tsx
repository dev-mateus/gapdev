import { useState } from 'react'
import { FaArrowTrendUp, FaBookOpen, FaChartLine, FaEnvelope, FaEye, FaEyeSlash, FaGoogle, FaLock } from 'react-icons/fa6'
import Button from '../../components/Button/Button'
import Checkbox from '../../components/Checkbox/Checkbox'
import Input from '../../components/Input/Input'
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
  isBackendConnected?: boolean;
};

function LoginPage({ isBackendConnected }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false)

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
                {' · '}
                Backend: {isBackendConnected ? 'conectado' : 'desconectado'}
              </p>
            </header>

            <form className={styles.form}>
              <Input
                label="E-mail"
                type="text"
                placeholder="seu@gmail.com"
                startIcon={<FaEnvelope />}
                autoComplete="email"
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
              />

              <div className={styles.formRow}>
                <Checkbox label="Lembrar de mim" />
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

              <Button type="button" variant="secondary" icon={<FaGoogle />} className={styles.googleButton}>
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

