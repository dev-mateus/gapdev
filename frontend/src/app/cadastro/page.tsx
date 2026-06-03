import { useState, type FormEvent } from 'react'
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

import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'

import Button from '../../components/Button/Button'
import Checkbox from '../../components/Checkbox/Checkbox'
import Input from '../../components/Input/Input'

import { apiPost } from '../../services/api'
import { validateEmail, validatePassword } from '../../utils/validators'

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


type CadastroPageProps = {
  isBackendConnected?: boolean
}


type LoginResponse = {
  access_token: string
  token_type: string
}


type CreateUserResponse = {
  id: string
  name: string
  email: string
}


function CadastroPage({ isBackendConnected }: CadastroPageProps) {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formMessage, setFormMessage] = useState('')
  const [formMessageType, setFormMessageType] = useState<
    'error' | 'success' | ''
  >('')


  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const googleAccessToken = tokenResponse.access_token

        if (!googleAccessToken) {
          throw new Error(
            'Nao foi possivel recuperar o token do Google.'
          )
        }

        const data = await apiPost<LoginResponse>(
          '/auth/google',
          {
            google_token: googleAccessToken,
          }
        )



        localStorage.setItem(
          'access_token',
          data.access_token
        )
        
        localStorage.setItem(
          'usuarioLogado',
          JSON.stringify({
            nome: name,
          })
        )

        localStorage.removeItem('usuarioEmail')

        window.dispatchEvent(
          new Event('auth-changed')
        )

        setFormMessageType('success')

        setFormMessage(
          'Login realizado com sucesso.'
        )

        navigate('/perfil')

      } catch (error) {
        setFormMessageType('error')

        setFormMessage(
          error instanceof Error
            ? error.message
            : 'Erro ao fazer login com Google.'
        )
      }
    },

    onError: () => {
      setFormMessageType('error')

      setFormMessage(
        'Erro ao autenticar com Google.'
      )
    },
  })


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (
      !trimmedName ||
      !trimmedEmail ||
      !password ||
      !confirmPassword
    ) {
      setFormMessageType('error')

      setFormMessage(
        'Preencha nome, e-mail e senha.'
      )

      return
    }

    if (!validateEmail(trimmedEmail)) {
      setFormMessageType('error')

      setFormMessage(
        'Por favor, insira um e-mail válido.'
      )

      return
    }

    const passwordValidation =
      validatePassword(password)

    if (!passwordValidation.isValid) {
      setFormMessageType('error')

      setFormMessage(
        `Senha inválida. Requisitos: ${passwordValidation.errors.join(', ')}`
      )

      return
    }

    if (password !== confirmPassword) {
      setFormMessageType('error')

      setFormMessage(
        'As senhas não coincidem.'
      )

      return
    }

    if (!acceptedTerms) {
      setFormMessageType('error')

      setFormMessage(
        'Você precisa aceitar os termos para continuar.'
      )

      return
    }

    setIsSubmitting(true)

    setFormMessage('')
    setFormMessageType('')

    try {
      await apiPost<CreateUserResponse>(
        '/users',
        {
          name: trimmedName,
          email: trimmedEmail,
          password,
        }
      )


      localStorage.setItem(
        `usuario_${trimmedEmail}`,
        JSON.stringify({
          nome: trimmedName,
          email: trimmedEmail,
        })
      )

      setFormMessageType('success')

      setFormMessage(
        'Conta criada com sucesso. Redirecionando para o login...'
      )

      window.setTimeout(() => {
        window.location.href = '/login'
      }, 1200)

    } catch (error) {
      setFormMessageType('error')

      setFormMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar a conta.'
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
            <span
              className={styles.brandMark}
              aria-hidden="true"
            >
              <FaChartLine />
            </span>

            <span className={styles.brandName}>
              <span>Gap</span>

              <span className={styles.brandAccent}>
                Dev
              </span>
            </span>
          </div>

          <div className={styles.heroCopy}>
            <h1 className={styles.title}>
              <span className={styles.titleLine}>
                Construa sua
              </span>

              <span className={styles.titleLine}>
                <strong
                  className={styles.titleAccent}
                >
                  carreira
                </strong>
                {' '}com estratégia.
              </span>
            </h1>

            <p className={styles.description}>
              Crie sua conta e receba um plano
              de estudos baseado no mercado real.
            </p>
          </div>

          <ul className={styles.featureList}>
            {features.map(
              ({
                title,
                description,
                icon: Icon,
              }) => (
                <li
                  key={title}
                  className={styles.featureItem}
                >
                  <span
                    className={styles.featureIcon}
                    aria-hidden="true"
                  >
                    <Icon />
                  </span>

                  <div>
                    <h2 className={styles.featureTitle}>
                      {title}
                    </h2>

                    <p className={styles.featureDescription}>
                      {description}
                    </p>
                  </div>
                </li>
              )
            )}
          </ul>
        </aside>


        <section className={styles.formPane}>
          <div className={styles.formCard}>

            <header className={styles.formHeader}>
              <h2 className={styles.formTitle}>
                Crie sua conta
              </h2>

              <p className={styles.formSubtitle}>
                Comece sua jornada agora
                {' · '}
                Backend: {
                  isBackendConnected
                    ? 'conectado'
                    : 'desconectado'
                }
              </p>
            </header>


            <form
              className={styles.form}
              onSubmit={handleSubmit}
            >

              <Input
                label="Nome"
                type="text"
                placeholder="nome"
                autoComplete="name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />


              <Input
                label="E-mail"
                type="text"
                placeholder="seu@gmail.com"
                startIcon={<FaEnvelope />}
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />


              <Input
                label="Senha"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                placeholder="**********"
                startIcon={<FaLock />}
                endIcon={
                  showPassword
                    ? <FaEyeSlash />
                    : <FaEye />
                }
                endIconLabel={
                  showPassword
                    ? 'Ocultar senha'
                    : 'Mostrar senha'
                }
                onEndIconClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />


              <Input
                label="Confirmar Senha"
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                placeholder="**********"
                startIcon={<FaLock />}
                endIcon={
                  showConfirmPassword
                    ? <FaEyeSlash />
                    : <FaEye />
                }
                endIconLabel={
                  showConfirmPassword
                    ? 'Ocultar confirmação de senha'
                    : 'Mostrar confirmação de senha'
                }
                onEndIconClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                required
              />


              <Checkbox
                label="Eu concordo com os termos"
                checked={acceptedTerms}
                onChange={(event) =>
                  setAcceptedTerms(
                    event.target.checked
                  )
                }
              />


              {formMessage ? (
                <p
                  className={`${styles.formMessage} ${
                    formMessageType === 'success'
                      ? styles.formMessageSuccess
                      : styles.formMessageError
                  }`}
                >
                  {formMessage}
                </p>
              ) : null}


              <Button
                type="submit"
                variant="primary"
                className={styles.submitButton}
                disabled={
                  isSubmitting ||
                  !isBackendConnected
                }
              >
                {
                  isSubmitting
                    ? 'Criando conta...'
                    : 'Criar conta'
                }
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
                Já tem uma conta?
                {' '}
                <a href="/login">
                  Entrar
                </a>
              </p>

            </form>
          </div>
        </section>

      </section>
    </main>
  )
}


export default CadastroPage
