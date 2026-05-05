import { useEffect, useState } from 'react'
import { FaCalendar } from 'react-icons/fa6'

import PageContainer from '../../components/PageContainer/PageContainer'
import PageHeader from '../../components/PageHeader/PageHeader'
import TabSwitcher, { type TabSwitcherItem } from '../../components/TabSwitcher/TabSwitcher'
import { fetchJobs, type JobItem } from './services/jobsService'

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
          const message = error instanceof Error ? error.message : 'Nao foi possivel carregar o historico.'

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

          {isLoading ? <p className={styles.emptyState}>Carregando vagas...</p> : null}

          {errorMessage ? <p className={styles.emptyState}>{errorMessage}</p> : null}

          {!isLoading && !errorMessage && isEmptyHistory ? (
            <p className={styles.emptyState}>Nenhuma vaga salva ainda.</p>
          ) : null}

          <div className={styles.list}>
            {jobs.map((job) => (
              <article key={job.id} className={styles.card}>
                <div className={styles.left}>
                  <h2 className={styles.jobTitle}>{job.job_title}</h2>
                  <p className={styles.companyName}>{job.company_name}</p>

                  <div className={styles.meta}>
                    <FaCalendar />
                    <span>Criado em {new Intl.DateTimeFormat('pt-BR').format(new Date(job.created_at))}</span>
                  </div>

                  <p className={styles.description}>{job.description}</p>
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