import { useEffect, useState } from 'react'
import { FaCalendar } from 'react-icons/fa6'

import PageContainer from '../../components/PageContainer/PageContainer'
import PageHeader from '../../components/PageHeader/PageHeader'
import TabSwitcher, { type TabSwitcherItem } from '../../components/TabSwitcher/TabSwitcher'
import { fetchJobs, type JobItem } from './services/jobsService'

import LoadingState from '../../components/LoadingState/LoadingState'
import { jobLevelLabel } from '../../utils/jobLevel'
import styles from './historicoVagas.module.css'

const tabs: TabSwitcherItem[] = [
  { id: 'analisar-vaga', label: 'Analisar vaga', href: '/vagas' },
  { id: 'minhas-vagas', label: 'Minhas vagas', href: '/historico-vagas' },
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

          <div className={styles.list}>
            {jobs.map((job) => (
              <article
                key={job.id}
                className={styles.card}
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
                </div>
              </article>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  )
}

export default HistoricoPage