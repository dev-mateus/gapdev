import { useState, useRef, useEffect, type FormEvent } from 'react'
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
import { Link, useNavigate } from 'react-router-dom'

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

  const [modalContent, setModalContent] = useState<'termos' | 'privacidade' | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!modalContent) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setModalContent(null)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [modalContent])


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

      const loginData = await apiPost<LoginResponse>(
        '/auth/login',
        {
          email: trimmedEmail,
          password,
        }
      )

      localStorage.setItem(
        'access_token',
        loginData.access_token
      )

      localStorage.setItem(
        `usuario_${trimmedEmail}`,
        JSON.stringify({
          nome: trimmedName,
          email: trimmedEmail,
        })
      )

      localStorage.setItem(
        'usuarioLogado',
        JSON.stringify({
          nome: trimmedName,
          email: trimmedEmail,
        })
      )

      localStorage.removeItem('usuarioEmail')

      window.dispatchEvent(
        new Event('auth-changed')
      )

      setFormMessageType('success')

      setFormMessage(
        'Conta criada com sucesso. Redirecionando...'
      )

      window.setTimeout(() => {
        navigate('/perfil')
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
                label={
                  <>
                    Eu li e concordo com os{' '}
                    <button
                      type="button"
                      className={styles.termsLink}
                      onClick={(e) => {
                        e.preventDefault()
                        setModalContent('termos')
                      }}
                    >
                      Termos de Uso
                    </button>
                    {' '}e a{' '}
                    <button
                      type="button"
                      className={styles.termsLink}
                      onClick={(e) => {
                        e.preventDefault()
                        setModalContent('privacidade')
                      }}
                    >
                      Política de Privacidade
                    </button>
                  </>
                }
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
                <Link to="/login">
                  Entrar
                </Link>
              </p>

            </form>
          </div>
        </section>

      </section>

      {modalContent && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalContent(null)
          }}
        >
          <div className={styles.modal} ref={modalRef}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalContent === 'termos' ? 'Termos de Uso' : 'Política de Privacidade'}
              </h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setModalContent(null)}
                aria-label="Fechar"
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              {modalContent === 'termos' ? (
                <>
                  <p><strong>Última atualização:</strong> 16 de junho de 2026</p>
                  <p>Bem-vindo ao GapDev.</p>
                  <p>Os presentes Termos de Uso regulam a utilização da plataforma GapDev, disponível para usuários interessados em desenvolvimento profissional e aprendizado na área de Tecnologia da Informação (TI).</p>
                  <p>Ao acessar, criar uma conta ou utilizar qualquer funcionalidade da plataforma, o usuário declara ter lido, compreendido e aceitado integralmente estes Termos.</p>

                  <h3>1. Sobre a Plataforma</h3>
                  <p>O GapDev é uma plataforma digital que auxilia usuários da área de Tecnologia da Informação na análise de vagas de emprego e desenvolvimento de competências técnicas.</p>
                  <p>Através de inteligência artificial e sistemas automatizados, a plataforma permite que o usuário:</p>
                  <ul>
                    <li>analise requisitos de vagas de emprego;</li>
                    <li>compare conhecimentos já adquiridos com os requisitos da vaga;</li>
                    <li>identifique tecnologias e competências necessárias;</li>
                    <li>gere planos de estudo personalizados;</li>
                    <li>acompanhe progresso de aprendizagem;</li>
                    <li>registre evolução técnica e habilidades adquiridas.</li>
                  </ul>

                  <h3>2. Cadastro e Acesso</h3>
                  <p>O acesso a determinadas funcionalidades exige criação de conta. O usuário poderá realizar cadastro através de email e senha ou autenticação via conta Google.</p>
                  <p>Ao cadastrar-se, o usuário declara que:</p>
                  <ul>
                    <li>fornecerá informações verdadeiras e atualizadas;</li>
                    <li>manterá suas credenciais protegidas;</li>
                    <li>será integralmente responsável pelas atividades realizadas em sua conta.</li>
                  </ul>

                  <h3>3. Dados Armazenados</h3>
                  <p>Para funcionamento da plataforma, o GapDev poderá armazenar informações como: endereço de email, nome fornecido pela autenticação Google, preferências de tecnologias, progresso de estudos, planos de estudo gerados, interações realizadas na plataforma e estatísticas de aprendizado semanal.</p>

                  <h3>4. Utilização da Inteligência Artificial</h3>
                  <p>O GapDev utiliza recursos de inteligência artificial para análise de vagas, interpretação de requisitos técnicos e geração de planos de estudo. Embora busquemos alta precisão, não garantimos que as recomendações geradas sejam totalmente completas, corretas ou suficientes para aprovação em processos seletivos.</p>

                  <h3>5. Responsabilidades do Usuário</h3>
                  <ul>
                    <li>utilizar a plataforma de forma ética e legal;</li>
                    <li>não tentar acessar sistemas, dados ou áreas restritas;</li>
                    <li>não utilizar a plataforma para atividades ilícitas;</li>
                    <li>não compartilhar contas com terceiros;</li>
                    <li>respeitar direitos autorais e propriedade intelectual.</li>
                  </ul>

                  <h3>6. Limitação de Responsabilidade</h3>
                  <p>O GapDev não poderá ser responsabilizado por reprovação em processos seletivos, decisões profissionais tomadas pelo usuário, indisponibilidade temporária da plataforma, falhas decorrentes de terceiros, perda de dados ocasionada por mau uso do usuário ou interrupções técnicas.</p>

                  <h3>7. Propriedade Intelectual</h3>
                  <p>Todo o conteúdo, identidade visual, funcionalidades, sistemas, tecnologias e marca GapDev pertencem exclusivamente à plataforma, sendo proibida reprodução sem autorização prévia.</p>

                  <h3>8. Privacidade e Proteção de Dados</h3>
                  <p>O tratamento de dados pessoais ocorre conforme nossa Política de Privacidade e em conformidade com a Lei Geral de Proteção de Dados (LGPD).</p>

                  <h3>9. Exclusão de Conta</h3>
                  <p>O usuário poderá solicitar exclusão da conta e dos dados vinculados através dos canais de suporte disponibilizados pela plataforma.</p>

                  <h3>10. Alterações dos Termos</h3>
                  <p>O GapDev poderá atualizar estes Termos de Uso a qualquer momento. Recomendamos revisão periódica deste documento.</p>

                  <h3>11. Aceitação dos Termos</h3>
                  <p>Ao utilizar a plataforma GapDev, o usuário declara estar ciente e de acordo com todos os termos apresentados neste documento.</p>

                  <h3>12. Contato</h3>
                  <p>Em caso de dúvidas, entre em contato através do email: suporte@gapdev.com.br</p>
                </>
              ) : (
                <>
                  <p><strong>Última atualização:</strong> 16 de junho de 2026</p>
                  <p>O GapDev respeita a privacidade dos usuários e compromete-se a proteger os dados pessoais coletados durante utilização da plataforma.</p>

                  <h3>1. Dados Coletados</h3>
                  <p>Poderemos coletar:</p>
                  <ul>
                    <li>email;</li>
                    <li>nome da conta Google;</li>
                    <li>dados de autenticação;</li>
                    <li>tecnologias selecionadas pelo usuário;</li>
                    <li>progresso de aprendizagem;</li>
                    <li>informações relacionadas aos planos de estudo;</li>
                    <li>estatísticas de uso da plataforma.</li>
                  </ul>

                  <h3>2. Finalidade dos Dados</h3>
                  <p>Os dados são utilizados para funcionamento da plataforma, autenticação de usuários, geração de planos personalizados, melhoria da experiência de uso, personalização de conteúdos e acompanhamento de progresso.</p>

                  <h3>3. Compartilhamento de Dados</h3>
                  <p>O GapDev não vende dados pessoais. Informações poderão ser compartilhadas apenas quando exigido por lei, para funcionamento de serviços essenciais da plataforma, ou com provedores de autenticação como Google.</p>

                  <h3>4. Segurança</h3>
                  <p>Adotamos medidas técnicas e administrativas para proteção dos dados armazenados. Apesar disso, nenhum sistema é totalmente imune a falhas de segurança.</p>

                  <h3>5. Direitos do Usuário</h3>
                  <p>O usuário poderá:</p>
                  <ul>
                    <li>solicitar acesso aos dados;</li>
                    <li>corrigir informações;</li>
                    <li>solicitar exclusão da conta;</li>
                    <li>revogar consentimentos quando aplicável.</li>
                  </ul>

                  <h3>6. Cookies</h3>
                  <p>O GapDev poderá utilizar cookies e tecnologias semelhantes para melhorar desempenho e experiência da plataforma.</p>

                  <h3>7. Contato</h3>
                  <p>Para dúvidas relacionadas à privacidade: suporte@gapdev.com.br</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}


export default CadastroPage
