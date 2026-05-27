
  import {
  Braces,
  Cloud,
  Code2,
  Database,
  FlaskConical,
  Laptop,
  Palette,
  Plus,
  Search,
  Server,
  Shield,
  Smartphone,
  Wrench,
  X,
} from 'lucide-react'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import PrimaryButton from '../../components/PrimaryButton/PrimaryButton'
import { apiGet, apiPost } from '../../services/api'

import styles from './tecnologias.module.css'

type Tecnologia = {
  id: string
  nome: string
  descricao: string
  categoria: string
}

type SkillCatalogItem = {
  id: string
  name: string
  category: string | null
  description: string | null
}

type UserSkillItem = {
  skill_id: string
}


const categoryIcons = {
  Linguagens: Braces,
  Frontend: Laptop,
  Backend: Server,
  'Banco de Dados': Database,
  Mobile: Smartphone,
  'DevOps & Cloud': Cloud,
  Ferramentas: Wrench,
  Testes: FlaskConical,
  'UI/UX': Palette,
  IA: Code2,
  Cibersegurança: Shield,
  Dados: Database,
  'Game Dev': Code2,
  'Low Code': Wrench,
  APIs: Server,
  CMS: Laptop,
  Versionamento: Wrench,
  Arquitetura: Braces,
}


function Tecnologias() {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [tecnologiasCatalogo, setTecnologiasCatalogo] = useState<Tecnologia[]>([])
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true)
  const [erroCatalogo, setErroCatalogo] = useState<string | null>(null)
  const [selecionadas, setSelecionadas] = useState<Tecnologia[]>([])
  const [salvando, setSalvando] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null)
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true

    async function carregarCatalogo() {
      try {
        setCarregandoCatalogo(true)
        setErroCatalogo(null)
        setErroSalvar(null)
        setMensagemSucesso(null)

        const [catalogo, userSkills] = await Promise.all([
          apiGet<SkillCatalogItem[]>('/skills/catalog'),
          apiGet<UserSkillItem[]>('/skills'),
        ])

        if (!ativo) return

        const tecnologias = catalogo
          .map((item) => ({
            id: item.id,
            nome: item.name,
            descricao: item.description ?? 'Sem descrição disponível',
            categoria: item.category ?? 'Outras',
          }))
          .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

        const idsUsuario = new Set(
          (userSkills ?? [])
            .map((item) => item.skill_id)
            .filter((value): value is string => Boolean(value)),
        )

        const preSelecionadas = tecnologias.filter((item) => idsUsuario.has(item.id))

        setTecnologiasCatalogo(tecnologias)
        setSelecionadas(preSelecionadas)
      } catch (error) {
        if (!ativo) return

        setErroCatalogo(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar as tecnologias.',
        )
      } finally {
        if (ativo) {
          setCarregandoCatalogo(false)
        }
      }
    }

    carregarCatalogo()

    return () => {
      ativo = false
    }
  }, [])


  const tecnologiasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) return []

    return tecnologiasCatalogo.filter((tech) => {
      const correspondeBusca = tech.nome.toLowerCase().startsWith(termo)

      const jaSelecionada = selecionadas.some(
        (selecionada) => selecionada.id === tech.id,
      )

      return correspondeBusca && !jaSelecionada
  })
}, [busca, selecionadas, tecnologiasCatalogo])

  const tecnologiasPorCategoria = useMemo(() => {
    return selecionadas.reduce<Record<string, Tecnologia[]>>((acc, tech) => {
      if (!acc[tech.categoria]) {
        acc[tech.categoria] = []
      }

      acc[tech.categoria].push(tech)

      return acc
    }, {})
  }, [selecionadas])

  

  const deveMostrarSugestoes = busca.trim().length > 0
  const deveMostrarSelecionadas = selecionadas.length > 0

  function adicionarTecnologia(tecnologia: Tecnologia) {
    setErroSalvar(null)
    setMensagemSucesso(null)

    const jaSelecionada = selecionadas.some(
      (tech) => tech.id === tecnologia.id,
    )

    if (jaSelecionada) return

    setSelecionadas((prev) => [...prev, tecnologia])
  }

  function removerTecnologia(id: string) {
    setErroSalvar(null)
    setMensagemSucesso(null)

    setSelecionadas((prev) =>
      prev.filter((tech) => tech.id !== id),
    )
  }

  async function salvarTecnologias() {
    if (selecionadas.length === 0 || salvando) {
      return
    }

    setSalvando(true)
    setErroSalvar(null)
    setMensagemSucesso(null)

    const resultados = await Promise.allSettled(
      selecionadas.map((tech) =>
        apiPost<{ id: string; skill_id: string }>('/skills', {
          skill_id: tech.id,
          level: 'Basic',
        }),
      ),
    )

    const sucesso = resultados.filter((item) => item.status === 'fulfilled').length

    if (sucesso === 0) {
      setErroSalvar('Não foi possível salvar suas tecnologias. Tente novamente.')
      setSalvando(false)
      return
    }

    if (sucesso < resultados.length) {
      setMensagemSucesso(`${sucesso} tecnologias foram salvas. Algumas não puderam ser persistidas agora.`)
    } else {
      setMensagemSucesso('Tecnologias salvas com sucesso.')
    }

    setSalvando(false)
    navigate('/vagas')
  }

  const searchRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          searchRef.current &&
          !searchRef.current.contains(event.target as Node)
        ) {
          setBusca('')
        }
      }

      document.addEventListener('mousedown', handleClickOutside)

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

  return (
    <section className={styles.container}>
      <div className={styles.searchContent}>
        <h2>Buscar e adicionar tecnologia</h2>

        <p>
          Selecione as tecnologias que você conhece. Essas informações serão
          usadas para analisar sua compatibilidade com as vagas e gerar
          recomendações de estudo personalizadas.
        </p>
      </div>
      
     <div
        className={styles.searchWrapper}
        ref={searchRef}
      >
        <div className={styles.searchBox}>
          <Search size={30} />

          <input
            type="text"
            placeholder="Digite uma tecnologia"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>

        {deveMostrarSugestoes && (
          <div className={styles.techList}>
            {carregandoCatalogo ? (
              <p className={styles.emptyMessage}>Carregando tecnologias...</p>
            ) : erroCatalogo ? (
              <p className={styles.emptyMessage}>{erroCatalogo}</p>
            ) : tecnologiasFiltradas.length > 0 ? (
              tecnologiasFiltradas.map((tech) => {
                const Icon =
                  categoryIcons[
                    tech.categoria as keyof typeof categoryIcons
                  ] ?? Code2

                return (
                  <div key={tech.id} className={styles.techCard}>
                    <div className={styles.techInfo}>
                      <div
                        className={styles.techIcon}
                        data-category={tech.categoria}
                      >
                        <Icon size={26} />
                      </div>

                      <div>

                      {erroSalvar ? (
                        <p className={styles.errorMessage}>{erroSalvar}</p>
                      ) : null}

                      {mensagemSucesso ? (
                        <p className={styles.successMessage}>{mensagemSucesso}</p>
                      ) : null}
                        <strong>{tech.nome}</strong>
                        <span>{tech.descricao}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={() => adicionarTecnologia(tech)}
                    >
                      <Plus size={30} />
                    </button>
                  </div>
                )
              })
            ) : (
              <p className={styles.emptyMessage}>
                Nenhuma tecnologia encontrada.
              </p>
            )}
          </div>
        )}
      </div>
      

      {deveMostrarSelecionadas && (
        <div className={styles.selectedWrapper}>
          <h3>
            Tecnologias selecionadas ({selecionadas.length})
          </h3>

          <div className={styles.categoryList}>
            {Object.entries(tecnologiasPorCategoria).map(
              ([categoria, tecnologias]) => {
                const Icon =
                  categoryIcons[
                    categoria as keyof typeof categoryIcons
                  ] ?? Code2

                return (
                  <div
                    key={categoria}
                    className={styles.categoryRow}
                  >
                    <div className={styles.categoryInfo}>

                      <div
                        className={styles.categoryIcon}
                        data-category={categoria}
                      >
                        <Icon size={24} />
                      </div>

                      <strong className={styles.categoryTitle}>
                        {categoria}
                      </strong>
                    </div>

                    <div className={styles.selectedArea}>
                      {tecnologias.map((tech) => (
                        <div
                          key={tech.id}
                          className={styles.tag}
                        >
                          <span>{tech.nome}</span>

                          <button
                            type="button"
                            onClick={() =>
                              removerTecnologia(tech.id)
                            }
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              },
            )}
          </div>
        </div>
      )}

      

      <div className={styles.footer}>
        <PrimaryButton
          type="button"
          className={styles.backButton}
        >
          Voltar
        </PrimaryButton>

        <PrimaryButton
          type="button"
          className={styles.saveButton}
          disabled={!deveMostrarSelecionadas || salvando}
          onClick={salvarTecnologias}
        >
          {salvando ? 'Salvando...' : 'Salvar e Continuar'}
        </PrimaryButton>
      </div>
    </section>
  )
}

export default Tecnologias