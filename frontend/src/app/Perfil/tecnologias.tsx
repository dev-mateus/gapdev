import {
  Code2,
  Plus,
  Search,
  X,
} from 'lucide-react'

import { useMemo, useState } from 'react'

import PrimaryButton from '../../components/PrimaryButton/PrimaryButton'

import styles from './tecnologias.module.css'

type Tecnologia = {
  id: number
  nome: string
  descricao: string
}

const tecnologiasMock: Tecnologia[] = [
  {
    id: 1,
    nome: 'React',
    descricao: 'Biblioteca JavaScript para construção de interfaces de usuário',
  },
  {
    id: 2,
    nome: 'React Native',
    descricao: 'Framework para desenvolvimento de dispositivos móveis',
  },
  {
    id: 3,
    nome: 'React Router',
    descricao: 'Biblioteca oficial para roteamento em aplicações React',
  },
  {
    id: 4,
    nome: 'Redux',
    descricao: 'Gerenciador de estado para aplicações JavaScript',
  },
  {
    id: 5,
    nome: 'JavaScript',
    descricao: 'Linguagem de programação para web',
  },
  {
    id: 6,
    nome: 'TypeScript',
    descricao: 'Superset tipado de JavaScript',
  },
  {
    id: 7,
    nome: 'CSS',
    descricao: 'Linguagem de estilos para interfaces',
  },
  {
    id: 8,
    nome: 'Node.js',
    descricao: 'Runtime JavaScript para backend',
  },
  {
    id: 9,
    nome: 'Git',
    descricao: 'Sistema de controle de versão',
  },
  {
    id: 10,
    nome: 'MySQL',
    descricao: 'Banco de dados relacional',
  },
]

function Tecnologias() {
  const [busca, setBusca] = useState('')
  const [selecionadas, setSelecionadas] = useState<string[]>([])

  const tecnologiasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return []
    }

    return tecnologiasMock.filter((tech) =>
      tech.nome.toLowerCase().includes(termo),
    )
  }, [busca])

  const deveMostrarSugestoes = busca.trim().length > 0
  const deveMostrarSelecionadas = selecionadas.length > 0

  function adicionarTecnologia(nome: string) {
    if (selecionadas.includes(nome)) return

    setSelecionadas((prev) => [...prev, nome])
  }

  function removerTecnologia(nome: string) {
    setSelecionadas((prev) =>
      prev.filter((tech) => tech !== nome),
    )
  }

  return (
    <section className={styles.container}>
      <div className={styles.searchContent}>
        <h2>Buscar e adicionar tecnologia</h2>

        <p>
          Selecione as tecnologias que você conhece. Essas informações serão usadas para analisar sua compatibilidade com as vagas e gerar recomendações  de estudo personalizadas.
        </p>

        <div className={styles.searchBox}>
          <Search size={30} />

          <input
            type="text"
            placeholder=""
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>

        {deveMostrarSugestoes && (
          <div className={styles.techList}>
            {tecnologiasFiltradas.length > 0 ? (
              tecnologiasFiltradas.map((tech) => (
                <div key={tech.id} className={styles.techCard}>
                  <div className={styles.techInfo}>
                    <div className={styles.techIcon}>
                      <Code2 size={26} />
                    </div>

                    <div>
                      <strong>{tech.nome}</strong>
                      <span>{tech.descricao}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => adicionarTecnologia(tech.nome)}
                  >
                    <Plus size={30} />
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>
                Nenhuma tecnologia encontrada.
              </p>
            )}
          </div>
        )}
      </div>

      {deveMostrarSelecionadas && (
        <>
          <div className={styles.divider} />

          <div className={styles.selectedArea}>
            {selecionadas.map((tech) => (
              <div key={tech} className={styles.tag}>
                <span>{tech}</span>

                <button
                  type="button"
                  onClick={() => removerTecnologia(tech)}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </>
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