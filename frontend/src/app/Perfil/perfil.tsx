import {
  Edit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from 'lucide-react'

import { useEffect, useState } from 'react'

import PageContainer from '../../components/PageContainer/PageContainer'
import PageHeader from '../../components/PageHeader/PageHeader'
import SectionCard from '../../components/SectionCard/SectionCard'
import Input from '../../components/Input/Input'
import TextArea from '../../components/TextArea/TextArea'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton'
import TabSwitcher, { type TabSwitcherItem } from '../../components/TabSwitcher/TabSwitcher'

import Tecnologias from './tecnologias'
import styles from './perfil.module.css'

type PerfilUsuario = {
  nome: string
  email: string
  area: string
  objetivo: string
}

const profileTabs: TabSwitcherItem[] = [
  {
    id: 'dados-pessoais',
    label: 'Dados Pessoais',
  },
  {
    id: 'tecnologias',
    label: 'Tecnologias',
  },
]

function Perfil() {
  const [activeTab, setActiveTab] = useState('dados-pessoais')
  const [editando, setEditando] = useState(true)

  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false)
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)
  const [definindoSenha, setDefinindoSenha] = useState(false)

  const [perfil, setPerfil] = useState<PerfilUsuario>({
    nome: '',
    email: '',
    area: 'Desenvolvimento Backend',
    objetivo: '',
  })

  useEffect(() => {
    const perfilSalvo = localStorage.getItem('perfilUsuario')
    const usuarioLogado = localStorage.getItem('usuarioLogado')

    if (perfilSalvo) {
      setPerfil(JSON.parse(perfilSalvo))
      setEditando(false)
      return
    }

    if (usuarioLogado) {
      const usuario = JSON.parse(usuarioLogado)

      setPerfil((prev) => ({
        ...prev,
        nome: usuario.name || usuario.nome || '',
        email: usuario.email || '',
      }))
    }
  }, [])

  function updateField(field: keyof PerfilUsuario, value: string) {
    setPerfil((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    localStorage.setItem('perfilUsuario', JSON.stringify(perfil))
    setEditando(false)
  }

  return (
    <div className={styles.content}>
      <PageContainer className={styles.expandedContainer}>
        <div className={styles.pageStack}>

          <PageHeader
            title="Perfil do usuário"
            description="Configure seu perfil técnico para receber recomendações personalizadas de estudo."
          />


          <div className={styles.profileTabs}>
            <button
              type="button"
              className={styles.activeTab}
            >
              <User size={18} />

              <span>Dados Pessoais</span>
            </button>

            <button
              type="button"
              className={styles.tab}
              onClick={() => navigateTo('/perfil/tecnologias')}
            >
              <Code2 size={18} />

              <span>Tecnologias</span>
            </button>
          </div>

          {editando ? (
            <SectionCard
              title="Informações básicas"
              description="Defina seu nome, objetivo profissional e área de interesse"
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
                      />
                    </div>
          <TabSwitcher
            tabs={profileTabs}
            activeTabId={activeTab}
            onTabChange={(tab) => setActiveTab(tab.id)}
          />

          {activeTab === 'dados-pessoais' && (
            <>
              {editando ? (
                <SectionCard
                  title="Informações básicas"
                  description="Defina seu nome, objetivo profissional e área de interesse."
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
                          />
                        </div>

                        <div className={styles.areaField}>
                          <label className={styles.selectGroup}>
                            <span>Área de interesse</span>

                            <div className={styles.selectWrapper}>
                              <select
                                value={perfil.area}
                                onChange={(event) =>
                                  updateField('area', event.target.value)
                                }
                                required
                              >
                                <option value="">Selecione uma área</option>
                                <option value="Desenvolvimento Backend">
                                  Desenvolvimento Backend
                                </option>
                                <option value="Desenvolvimento Frontend">
                                  Desenvolvimento Frontend
                                </option>
                                <option value="Desenvolvimento Full Stack">
                                  Desenvolvimento Full Stack
                                </option>
                                <option value="DevOps">DevOps</option>
                                <option value="Banco de Dados">
                                  Banco de Dados
                                </option>
                                <option value="Mobile">Mobile</option>
                                <option value="UI/UX Design">
                                  UI/UX Design
                                </option>
                                <option value="Ciência de Dados">
                                  Ciência de Dados
                                </option>
                                <option value="Segurança da Informação">
                                  Segurança da Informação
                                </option>
                                <option value="QA/Testes">QA/Testes</option>
                              </select>
                            </div>
                          </label>
                        </div>

                        <TextArea
                          label="Objetivo Profissional"
                          placeholder="Coloque seu objetivo profissional:"
                          value={perfil.objetivo}
                          onChange={(event) =>
                            updateField('objetivo', event.target.value)
                          }
                          maxLength={300}
                          required
                        />

                        <span className={styles.characterCount}>
                          {perfil.objetivo.length}/300
                        </span>

                      </div>

                      <div className={styles.passwordArea}>
                        <div className={styles.passwordBox}>
                          {!definindoSenha ? (
                            <>
                              <div className={styles.passwordTitle}>
                                <div className={styles.passwordIcon}>
                                  <Lock size={20} />
                                </div>

                                <h3>Autenticação Google</h3>
                              </div>

                              <div className={styles.authDivider} />

                              <p className={styles.authMessage}>
                                Esta conta utiliza autenticação via Google. Você
                                também pode definir uma senha para acessar a
                                plataforma com e-mail e senha.
                              </p>

                              <PrimaryButton
                                type="button"
                                className={styles.passwordButton}
                                onClick={() => setDefinindoSenha(true)}
                              >
                                Definir senha
                              </PrimaryButton>
                            </>
                          ) : (
                            <>
                              <div className={styles.passwordTitle}>
                                <div className={styles.passwordIcon}>
                                  <Lock size={20} />
                                </div>

                                <h3>Definir senha</h3>
                              </div>

                              <Input
                                label="Senha:"
                                type={mostrarSenhaAtual ? 'text' : 'password'}
                                placeholder="Digite a senha"
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
                                label="Confirmar Senha:"
                                type={mostrarNovaSenha ? 'text' : 'password'}
                                placeholder="Confirme a senha"
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
                              >
                                Salvar senha
                              </PrimaryButton>

                              <button
                                type="button"
                                className={styles.cancelPasswordButton}
                                onClick={() => setDefinindoSenha(false)}
                              >
                                Cancelar
                              </button>
                            </>
                          )}

                          <div className={styles.authDivider} />

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
                      <p>{perfil.area}</p>

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


                  <div className={styles.profileBottom}>
                    <div>
                      <h3>Área de interesse</h3>
                      <p>{perfil.area}</p>
                    </div>

                    <div>
                      <h3>Objetivo Profissional</h3>
                      <p>{perfil.objetivo}</p>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {activeTab === 'tecnologias' && <Tecnologias />}
        </div>
      </PageContainer>
    </div>
  )
}

export default Perfil