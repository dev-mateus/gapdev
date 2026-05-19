
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

import PrimaryButton from '../../components/PrimaryButton/PrimaryButton'

import styles from './tecnologias.module.css'

type Tecnologia = {
  id: number
  nome: string
  descricao: string
  categoria: string
}

const tecnologiasMock: Tecnologia[] = [
  // Linguagens
  {
    id: 1,
    nome: 'JavaScript',
    descricao: 'Linguagem de programação para web',
    categoria: 'Linguagens',
  },
  {
    id: 2,
    nome: 'Python',
    descricao: 'Linguagem versátil para backend e IA',
    categoria: 'Linguagens',
  },

  // Frontend
  {
    id: 3,
    nome: 'React',
    descricao: 'Biblioteca JavaScript para interfaces',
    categoria: 'Frontend',
  },
  {
    id: 4,
    nome: 'Next.js',
    descricao: 'Framework React para aplicações web',
    categoria: 'Frontend',
  },

  // Backend
  {
    id: 5,
    nome: 'Node.js',
    descricao: 'Runtime JavaScript para backend',
    categoria: 'Backend',
  },
  {
    id: 6,
    nome: 'FastAPI',
    descricao: 'Framework Python para APIs',
    categoria: 'Backend',
  },

  // Mobile
  {
    id: 7,
    nome: 'React Native',
    descricao: 'Framework mobile multiplataforma',
    categoria: 'Mobile',
  },
  {
    id: 8,
    nome: 'Flutter',
    descricao: 'Framework para aplicativos móveis',
    categoria: 'Mobile',
  },

  // Banco de Dados
  {
    id: 9,
    nome: 'PostgreSQL',
    descricao: 'Banco de dados relacional',
    categoria: 'Banco de Dados',
  },
  {
    id: 10,
    nome: 'MongoDB',
    descricao: 'Banco de dados NoSQL',
    categoria: 'Banco de Dados',
  },

  // DevOps & Cloud
  {
    id: 11,
    nome: 'Docker',
    descricao: 'Ferramenta de containers',
    categoria: 'DevOps & Cloud',
  },
  {
    id: 12,
    nome: 'AWS',
    descricao: 'Serviços em nuvem',
    categoria: 'DevOps & Cloud',
  },

  // Ferramentas
  {
    id: 13,
    nome: 'Postman',
    descricao: 'Teste e documentação de APIs',
    categoria: 'Ferramentas',
  },
  {
    id: 14,
    nome: 'Insomnia',
    descricao: 'Cliente para APIs REST',
    categoria: 'Ferramentas',
  },

  // Testes
  {
    id: 15,
    nome: 'Jest',
    descricao: 'Framework de testes JavaScript',
    categoria: 'Testes',
  },
  {
    id: 16,
    nome: 'Cypress',
    descricao: 'Testes end-to-end',
    categoria: 'Testes',
  },

  // UI/UX
  {
    id: 17,
    nome: 'Figma',
    descricao: 'Design de interfaces',
    categoria: 'UI/UX',
  },
  {
    id: 18,
    nome: 'Design System',
    descricao: 'Sistema visual reutilizável',
    categoria: 'UI/UX',
  },

  // IA
  {
    id: 19,
    nome: 'Machine Learning',
    descricao: 'Modelos inteligentes e preditivos',
    categoria: 'IA',
  },
  {
    id: 20,
    nome: 'TensorFlow',
    descricao: 'Framework para IA',
    categoria: 'IA',
  },

  // cibersegurança
  {
  id: 21,
  nome: 'JWT',
  descricao: 'Autenticação baseada em tokens',
  categoria: 'Cibersegurança',
},
{
  id: 22,
  nome: 'OAuth',
  descricao: 'Autorização segura',
  categoria: 'Cibersegurança',
},

  // Dados
  {
    id: 23,
    nome: 'Pandas',
    descricao: 'Manipulação de dados em Python',
    categoria: 'Dados',
  },
  {
    id: 24,
    nome: 'Power BI',
    descricao: 'Visualização de dados',
    categoria: 'Dados',
  },

  // Game Dev
  {
    id: 25,
    nome: 'Unity',
    descricao: 'Engine para jogos',
    categoria: 'Game Dev',
  },
  {
    id: 26,
    nome: 'Unreal Engine',
    descricao: 'Engine gráfica para jogos',
    categoria: 'Game Dev',
  },

  // Low Code
  {
    id: 27,
    nome: 'Bubble',
    descricao: 'Plataforma low code',
    categoria: 'Low Code',
  },
  {
    id: 28,
    nome: 'FlutterFlow',
    descricao: 'Construção visual de apps',
    categoria: 'Low Code',
  },

  // APIs
  {
    id: 29,
    nome: 'REST',
    descricao: 'Arquitetura para APIs',
    categoria: 'APIs',
  },
  {
    id: 30,
    nome: 'GraphQL',
    descricao: 'Linguagem de consulta para APIs',
    categoria: 'APIs',
  },

  // CMS
  {
    id: 31,
    nome: 'WordPress',
    descricao: 'CMS para sites',
    categoria: 'CMS',
  },
  {
    id: 32,
    nome: 'Strapi',
    descricao: 'CMS Headless',
    categoria: 'CMS',
  },

  // Versionamento
  {
    id: 33,
    nome: 'Git',
    descricao: 'Controle de versão',
    categoria: 'Versionamento',
  },
  {
    id: 34,
    nome: 'GitHub',
    descricao: 'Hospedagem de repositórios',
    categoria: 'Versionamento',
  },

  // Arquitetura
  {
    id: 35,
    nome: 'Clean Architecture',
    descricao: 'Arquitetura escalável de software',
    categoria: 'Arquitetura',
  },
  {
    id: 36,
    nome: 'Microservices',
    descricao: 'Arquitetura distribuída',
    categoria: 'Arquitetura',
  },
]


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
  const [busca, setBusca] = useState('')
  const [selecionadas, setSelecionadas] = useState<Tecnologia[]>([])


  const tecnologiasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) return []

    return tecnologiasMock.filter((tech) => {
      const correspondeBusca = tech.nome.toLowerCase().startsWith(termo)

      const jaSelecionada = selecionadas.some(
        (selecionada) => selecionada.id === tech.id,
      )

      return correspondeBusca && !jaSelecionada
  })
}, [busca, selecionadas])

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
    const jaSelecionada = selecionadas.some(
      (tech) => tech.id === tecnologia.id,
    )

    if (jaSelecionada) return

    setSelecionadas((prev) => [...prev, tecnologia])
  }

  function removerTecnologia(id: number) {
    setSelecionadas((prev) =>
      prev.filter((tech) => tech.id !== id),
    )
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
            {tecnologiasFiltradas.length > 0 ? (
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
          disabled={!deveMostrarSelecionadas}
        >
          Salvar e Continuar
        </PrimaryButton>
      </div>
    </section>
  )
}

export default Tecnologias