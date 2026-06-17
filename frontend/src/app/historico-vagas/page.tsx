import { useEffect, useMemo, useRef, useState } from 'react'
import { FaCalendar } from 'react-icons/fa6'
import { ArrowUpDown, Search, Trash } from 'lucide-react'

import PageContainer from '../../components/PageContainer/PageContainer'
import PageHeader from '../../components/PageHeader/PageHeader'

import TabSwitcher, { type TabSwitcherItem } from '../../components/TabSwitcher/TabSwitcher'
import { fetchJobs, deleteJob, type JobItem } from './services/jobsService'

import LoadingState from '../../components/LoadingState/LoadingState'
import { jobLevelLabel } from '../../utils/jobLevel'
import styles from './historicoVagas.module.css'


const tabs: TabSwitcherItem[] = [
  { id: 'analisar-vaga', label: 'Analisar vaga', href: '/vagas' },
  { id: 'minhas-vagas', label: 'Minhas vagas', href: '/historico-vagas' },
]

type SortOption = 'recent' | 'oldest' | 'compatibility' | 'company'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigas' },
  { value: 'compatibility', label: 'Maior compatibilidade' },
  { value: 'company', label: 'Empresa (A-Z)' },
]

function navigateTo(path: string) {
  if (window.location.pathname === path) return

  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function getJobCompatibility(job: JobItem): number | undefined {
  if (typeof job.compatibility === 'number') {
    return job.compatibility
  }

  return undefined
}

function HistoricoPage() {
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isEmptyHistory, setIsEmptyHistory] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [removingIds, setRemovingIds] = useState<string[]>([])
  const [isOpenSortDropdown, setIsOpenSortDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6
  const sortDropdownRef = useRef<HTMLLabelElement | null>(null)


  useEffect(() => {
    let isMounted = true

    async function loadJobs() {
      try {
        const response = await fetchJobs()

        if (isMounted) {
          setJobs(response)
          setIsEmptyHistory(response.length === 0)
        }
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : 'Não foi possível carregar o histórico.'

          if (message.includes('404')) {
            setJobs([])
            setIsEmptyHistory(true)
            setErrorMessage('')
          } else {
            setErrorMessage(message)
            setIsEmptyHistory(false)
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadJobs()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isOpenSortDropdown) return

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const el = sortDropdownRef.current
      if (!el) return

      const target = event.target as Node | null
      if (!target) return

      if (!el.contains(target)) {
        setIsOpenSortDropdown(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpenSortDropdown(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('touchstart', handlePointerDown, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('touchstart', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpenSortDropdown])


  const visibleJobs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    const filtered = term
      ? jobs.filter((job) => {
          const haystack = [
            job.job_title,
            job.company_name,
            ...(job.tecnologias ?? []),
          ]
            .join(' ')
            .toLowerCase()

          return haystack.includes(term)
        })
      : jobs

    const sorted = [...filtered]

    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'compatibility':
          return (getJobCompatibility(b) ?? -1) - (getJobCompatibility(a) ?? -1)
        case 'company':
          return a.company_name.localeCompare(b.company_name, 'pt-BR')
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return sorted
  }, [jobs, searchTerm, sortBy])

  // Volta para a primeira página sempre que a busca ou a ordenação mudam,
  // evitando ficar numa página que deixou de existir após filtrar.
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortBy])

  const totalPages = Math.max(1, Math.ceil(visibleJobs.length / ITEMS_PER_PAGE))

  // Protege contra a página atual ficar fora do intervalo (ex.: após excluir).
  const safePage = Math.min(currentPage, totalPages)

  const paginatedJobs = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return visibleJobs.slice(start, start + ITEMS_PER_PAGE)
  }, [visibleJobs, safePage])

  const hasNoResults =
    !isLoading && !errorMessage && !isEmptyHistory && visibleJobs.length === 0

  function handleTabChange(tab: TabSwitcherItem) {
    if (!tab.href) return
    navigateTo(tab.href)
  }

  function handleJobClick(job: JobItem) {
    // Rebuild the analysis context so the compatibility page can re-run the
    // analysis for this job against the user's current skills.
    const analysisContext = JSON.stringify({
      title: job.job_title,
      company: job.company_name,
      description: job.description,
    })
    window.sessionStorage.setItem(`analysis:${job.id}`, analysisContext)

    const params = new URLSearchParams()
    params.set('jobId', job.id)
    navigateTo(`/compatibility?${params.toString()}`)
  }

  return (
    <div className={styles.content}>
      <PageContainer className={styles.expandedContainer}>
        <div className={styles.pageStack}>
          <PageHeader
            title="Histórico de Vagas"
            description="Todas as vagas que você analisou"
          />

          <TabSwitcher
            tabs={tabs}
            activeTabId="minhas-vagas"
            onTabChange={handleTabChange}
          />

          {isLoading ? <LoadingState message="Carregando vagas" /> : null}

          {errorMessage ? <p className={styles.emptyState}>{errorMessage}</p> : null}

          {!isLoading && !errorMessage && isEmptyHistory ? (
            <p className={styles.emptyState}>Nenhuma vaga salva ainda.</p>
          ) : null}

          {!isLoading && !errorMessage && !isEmptyHistory ? (
            <div className={styles.toolbar}>
              <div className={styles.searchField}>
                <Search size={18} className={styles.searchIcon} aria-hidden="true" />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Buscar por cargo, empresa ou tecnologia"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Buscar vagas"
                />
              </div>

              <label
                ref={sortDropdownRef}
                className={styles.sortField}
                role="button"
                tabIndex={0}
                aria-label="Ordenar vagas"
                aria-expanded={isOpenSortDropdown}
                onClick={() => setIsOpenSortDropdown((prev) => !prev)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setIsOpenSortDropdown((prev) => !prev)
                  }
                }}
              >
                <ArrowUpDown size={16} aria-hidden="true" />
                <span className={styles.sortLabel}>Ordenar por</span>

                <span className={styles.sortValue}>
                  {sortOptions.find((o) => o.value === sortBy)?.label ?? ''}
                </span>

                {isOpenSortDropdown ? (
                  <ul className={styles.sortDropdown} role="listbox" aria-label="Opções de ordenação">
                    {sortOptions.map((option) => {
                      const isSelected = option.value === sortBy
                      return (
                        <li
                          key={option.value}
                          className={styles.sortOption}
                          role="option"
                          aria-selected={isSelected}
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation()
                            setSortBy(option.value)
                            setIsOpenSortDropdown(false)
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setSortBy(option.value)
                              setIsOpenSortDropdown(false)
                            }
                          }}
                        >
                          {option.label}
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
              </label>

            </div>
          ) : null}

          {hasNoResults ? (
            <p className={styles.emptyState}>
              Nenhuma vaga encontrada para “{searchTerm.trim()}”.
            </p>
          ) : null}

          <div className={styles.list}>
            {paginatedJobs.map((job) => {
              const isRemoving = removingIds.includes(job.id)

              if (confirmDeleteId === job.id) {
                return (
                  <div key={job.id} className={`${styles.card} ${styles.confirmBanner}`}>
                    <div className={styles.left}>
                      <h2 className={styles.jobTitle}>Excluir {job.job_title}?</h2>
                      <p className={styles.companyName}>Esta ação não pode ser desfeita.</p>
                    </div>

                    <div className={styles.right}>
                      <div className={styles.confirmButtons}>
                        <button
                          type="button"
                          className={styles.confirmCancel}
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className={styles.confirmDelete}
                          onClick={async () => {
                            try {
                              await deleteJob(job.id)
                              setRemovingIds((prev) => [...prev, job.id])
                              setConfirmDeleteId(null)

                              setTimeout(() => {
                                setJobs((prev) => prev.filter((j) => j.id !== job.id))
                                setRemovingIds((prev) => prev.filter((id) => id !== job.id))
                                setIsEmptyHistory(() => {
                                  const remaining = visibleJobs.filter((j) => j.id !== job.id)
                                  return remaining.length === 0
                                })
                              }, 260)
                            } catch (err) {
                              // ignore for now; could show toast
                              setConfirmDeleteId(null)
                            }
                          }}
                        >
                          Sim, excluir
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <article
                  key={job.id}
                  className={`${styles.card} ${isRemoving ? styles.removing : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleJobClick(job)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleJobClick(job)
                    }
                  }}
                >
                  <div className={styles.left}>
                    <h2 className={styles.jobTitle}>{job.job_title}</h2>
                    <p className={styles.companyName}>{job.company_name}</p>

                    <div className={styles.meta}>
                      <FaCalendar />
                      <span>Analisado em {new Intl.DateTimeFormat('pt-BR').format(new Date(job.created_at))}</span>
                    </div>

                    <div className={styles.tags}>
                      {job.tecnologias?.slice(0, 5).map((tech) => (
                        <span key={tech} className={styles.tag}>{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.right}>
                    <div className={styles.levelBadge}>
                      Nível: {jobLevelLabel(job.level)}
                    </div>
                    <div className={styles.match}>
                      <div className={styles.matchValue}>
                        {getJobCompatibility(job) !== undefined ? `${getJobCompatibility(job)}%` : '-'}
                      </div>
                      <div className={styles.matchLabel}>
                        Compatibilidade
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.trashButton}
                      aria-label={`Excluir ${job.job_title}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmDeleteId(job.id)
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Trash size={16} className={styles.trashIcon} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          {totalPages > 1 ? (
            <nav className={styles.pagination} aria-label="Paginação do histórico">
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage <= 1}
              >
                Anterior
              </button>

              <span className={styles.pageInfo}>
                Página {safePage} de {totalPages}
              </span>

              <button
                type="button"
                className={styles.pageButton}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={safePage >= totalPages}
              >
                Próxima
              </button>
            </nav>
          ) : null}
        </div>
      </PageContainer>
    </div>
  )
}

export default HistoricoPage