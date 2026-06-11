import {
  Edit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from 'lucide-react'

import { type FormEvent, useEffect, useState } from 'react'

import PageContainer from '../../components/PageContainer/PageContainer'
import PageHeader from '../../components/PageHeader/PageHeader'
import SectionCard from '../../components/SectionCard/SectionCard'
import Input from '../../components/Input/Input'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton'

import Tecnologias from './tecnologias'
import styles from './perfil.module.css'
import { apiGet, apiPatch, apiPost } from '../../services/api'

const SENIORITY_OPTIONS = ['Estágio', 'Júnior', 'Pleno', 'Sênior'] as const

const SENIORITY_MAP: Record<string, string> = {
  'Estágio': 'Intern',
  'Júnior': 'Junior',
  'Pleno': 'MidLevel',
  'Sênior': 'Senior',
}

const SENIORITY_REVERSE: Record<string, string> = {
  'Intern': 'Estágio',
  'Junior': 'Júnior',
  'MidLevel': 'Pleno',
  'Senior': 'Sênior',
}

type PerfilUsuario = {
  nome: string
  email: string
  seniorityLevel: string
}

type AuthProvider = 'google' | 'credentials'

type UserMeResponse = {
  id: string
  name: string
  email: string
  seniority_level: string | null
}

function Perfil() {
  const [editando, setEditando] = useState(true)

  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false)
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)
  const [definindoSenha, setDefinindoSenha] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')

  const [mensagemSenha, setMensagemSenha] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [salvandoSenha, setSalvandoSenha] = useState(false)

  const [perfil, setPerfil] = useState<PerfilUsuario>({
    nome: '',
    email: '',
    seniorityLevel: '',
  })

  const [authProvider, setAuthProvider] = useState<AuthProvider>('credentials')

  useEffect(() => {
    const usuarioLogado = localStorage.getItem('usuarioLogado')

    if (usuarioLogado) {
      const usuario = JSON.parse(usuarioLogado)

      setAuthProvider(
        usuario.authProvider === 'google' ? 'google' : 'credentials'
      )

      setPerfil((prev) => ({
        ...prev,
        nome: usuario.nome || usuario.name || '',
        email: usuario.email || '',
      }))
    }

    apiGet<UserMeResponse>('/users/me')
      .then((data) => {
        setPerfil((prev) => ({
          ...prev,
          nome: data.name || prev.nome,
          email: data.email || prev.email,
          seniorityLevel: data.seniority_level
            ? (SENIORITY_REVERSE[data.seniority_level] ?? '')
            : '',
        }))
        if (data.name && data.seniority_level) {
          setEditando(false)
        }
      })
      .catch(() => {})
  }, [])

  function updateField(field: keyof PerfilUsuario, value: string) {
    setPerfil((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await apiPatch<UserMeResponse>('/users/me', {
        name: perfil.nome,
        seniority_level: SENIORITY_MAP[perfil.seniorityLevel] || null,
      })

      const usuarioLogado = localStorage.getItem('usuarioLogado')

      if (usuarioLogado) {
        const usuario = JSON.parse(usuarioLogado)

        localStorage.setItem(
          'usuarioLogado',
          JSON.stringify({
            ...usuario,
            nome: perfil.nome,
            name: perfil.nome,
            email: perfil.email,
          })
        )
      }

      setEditando(false)
    } catch {
      setEditando(false)
    }
  }

  async function handleChangePassword() {
    setMensagemSenha('')
    setErroSenha('')

    if (!senhaAtual.trim()) {
      setErroSenha('Informe a senha atual.')
      return
    }

    if (!novaSenha.trim()) {
      setErroSenha('Informe a nova senha.')
      return
    }

    try {
      setSalvandoSenha(true)

      const response = await apiPost<{ message: string }>(
        '/auth/change-password',
        {
          current_password: senhaAtual,
          new_password: novaSenha,
        }
      )

      setMensagemSenha(response.message)
      setSenhaAtual('')
      setNovaSenha('')
      setDefinindoSenha(false)
    } catch (error) {
      setErroSenha(
        error instanceof Error
          ? error.message
          : 'Erro ao alterar senha.'
      )
    } finally {
      setSalvandoSenha(false)
    }
  }

  return (
    <div className={styles.content}>
      <PageContainer className={styles.expandedContainer}>
        <div className={styles.pageStack}>
          <PageHeader
            title="Perfil do usuário"
            description="Configure seu perfil técnico para receber recomendações personalizadas de estudo."
          />

          {editando ? (
            <SectionCard
              title="Informações básicas"
              description="Defina seu nome e nível de senioridade."
              icon={<User size={22} />}
            >
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formContent}>
                  <div className={styles.leftForm}>
                    <div className={styles.topFields}>
                      <Input
                        label="Nome completo"
                        type="text"
                        placeholder="Seu nome"
                        value={perfil.nome}
                        onChange={(event) =>
                          updateField('nome', event.target.value)
                        }
                        required
                      />

                      <Input
                        label="E-mail"
                        type="text"
                        placeholder="seu@gmail.com"
                        value={perfil.email}
                        onChange={(event) =>
                          updateField('email', event.target.value)
                        }
                        required
                        disabled
                      />
                    </div>

                    <div className={styles.seniorityGroup}>
                      <label className={styles.seniorityLabel}>Nível de senioridade</label>

                      <div className={styles.seniorityOptions}>
                        {SENIORITY_OPTIONS.map((level) => (
                          <button
                            key={level}
                            type="button"
                            className={`${styles.seniorityOption} ${
                              perfil.seniorityLevel === level ? styles.seniorityOptionActive : ''
                            }`}
                            onClick={() => updateField('seniorityLevel', level)}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.passwordArea}>
                    <div className={styles.passwordBox}>
                      {!definindoSenha ? (
                        <>
                          <div className={styles.passwordTitle}>
                            <div className={styles.passwordIcon}>
                              <Lock size={20} />
                            </div>

                            <h3>
                              {authProvider === 'google'
                                ? 'Autenticação Google'
                                : 'Senha de acesso'}
                            </h3>
                          </div>

                          <div className={styles.authDivider} />

                          <p className={styles.authMessage}>
                            {authProvider !== 'google' &&
                              'Esta conta utiliza login com e-mail e senha. Você pode alterar sua senha de acesso.'}
                          </p>

                          {authProvider === 'credentials' && (
                            <PrimaryButton
                              type="button"
                              className={styles.passwordButton}
                              onClick={() => setDefinindoSenha(true)}
                            >
                              Alterar senha
                            </PrimaryButton>
                          )}
                        </>
                      ) : authProvider === 'credentials' ? (
                        <>
                          <div className={styles.passwordTitle}>
                            <div className={styles.passwordIcon}>
                              <Lock size={20} />
                            </div>

                            <h3>Alterar senha</h3>
                          </div>

                          <Input
                            label="Senha Atual"
                            type={mostrarSenhaAtual ? 'text' : 'password'}
                            placeholder="Digite a senha atual:"
                            value={senhaAtual}
                            onChange={(event) => setSenhaAtual(event.target.value)}
                            endIcon={
                              <button
                                type="button"
                                className={styles.eyeButton}
                                onClick={() =>
                                  setMostrarSenhaAtual(!mostrarSenhaAtual)
                                }
                              >
                                {mostrarSenhaAtual ? (
                                  <EyeOff size={20} />
                                ) : (
                                  <Eye size={20} />
                                )}
                              </button>
                            }
                          />

                          <Input
                            label="Senha Nova"
                            type={mostrarNovaSenha ? 'text' : 'password'}
                            placeholder="Digite a senha nova:"
                            value={novaSenha}
                            onChange={(event) => setNovaSenha(event.target.value)}
                            endIcon={
                              <button
                                type="button"
                                className={styles.eyeButton}
                                onClick={() =>
                                  setMostrarNovaSenha(!mostrarNovaSenha)
                                }
                              >
                                {mostrarNovaSenha ? (
                                  <EyeOff size={20} />
                                ) : (
                                  <Eye size={20} />
                                )}
                              </button>
                            }
                          />

                          <PrimaryButton
                            type="button"
                            className={styles.passwordButton}
                            onClick={handleChangePassword}
                          >
                            {salvandoSenha ? 'Salvando...' : 'Alterar'}
                          </PrimaryButton>

                          <button
                            type="button"
                            className={styles.cancelPasswordButton}
                            onClick={() => {
                              setDefinindoSenha(false)
                              setSenhaAtual('')
                              setNovaSenha('')
                              setErroSenha('')
                              setMensagemSenha('')
                            }}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : null}

                      {erroSenha && (
                        <p className={styles.passwordError}>{erroSenha}</p>
                      )}

                      {mensagemSenha && (
                        <p className={styles.passwordSuccess}>{mensagemSenha}</p>
                      )}

                      {authProvider === 'google' && (
                        <div className={styles.googleConnected}>
                          <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            width={38}
                            height={38}
                          />

                          <div className={styles.googleConnectedText}>
                            <strong>Conectado com Google</strong>
                            <span>Conta autenticada com sucesso</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.footerActions}>
                    <PrimaryButton
                      type="submit"
                      className={styles.continueButton}
                    >
                      Salvar
                    </PrimaryButton>
                  </div>
                </div>
              </form>
            </SectionCard>
          ) : (
            <section className={styles.profileCard}>
              <div className={styles.profileTop}>
                <div className={styles.avatar}>
                  <User size={48} />
                </div>

                <div className={styles.profileInfo}>
                  <h2>{perfil.nome}</h2>
                  {perfil.seniorityLevel && (
                    <span className={styles.seniorityBadge}>{perfil.seniorityLevel}</span>
                  )}

                  <span className={styles.email}>
                    <Mail size={18} />
                    {perfil.email}
                  </span>
                </div>

                <PrimaryButton
                  type="button"
                  className={styles.editButton}
                  icon={<Edit size={18} />}
                  onClick={() => setEditando(true)}
                >
                  Editar
                </PrimaryButton>
              </div>
            </section>
          )}

          <Tecnologias />
        </div>
      </PageContainer>
    </div>
  )
}

export default Perfil
