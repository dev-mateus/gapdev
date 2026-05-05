import { FaCalendar } from 'react-icons/fa6'

import PageContainer from '../../components/PageContainer/PageContainer'
import PageHeader from '../../components/PageHeader/PageHeader'
import TabSwitcher, { type TabSwitcherItem } from '../../components/TabSwitcher/TabSwitcher'

import styles from './historicoVagas.module.css'

const tabs: TabSwitcherItem[] = [
  { id: 'analisar-vaga', label: 'Analisar vaga', href: '/vagas' },
  { id: 'minhas-vagas', label: 'Minhas vagas', href: '/historico-vagas' },
]

const vagas = [
  {
    id: 1,
    titulo: 'Desenvolvedor Full Stack Pleno',
    data: '08/04/2026',
    
    compatibilidade: '8%',
    tecnologias: ['Node.js', 'NestJS', 'PostgreSQL', 'MySQL', 'Git'],
  },
  {
    id: 2,
    titulo: 'Frontend React Developer',
    data: '05/04/2026',
    
    compatibilidade: '12%',
    tecnologias: ['React', 'TypeScript', 'CSS', 'Vite'],
  },
]




function navigateTo(path: string) {
  if (window.location.pathname === path) return

  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function HistoricoPage() {
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

          <div className={styles.list}>
            {vagas.map((vaga) => (
              <article key={vaga.id} className={styles.card}>
                <div className={styles.left}>
                  <h2 className={styles.jobTitle}>{vaga.titulo}</h2>

                  <div className={styles.meta}>
                    <FaCalendar />
                    <span>Analisado em {vaga.data}</span>
                  </div>

                  <div className={styles.tags}>
                    {vaga.tecnologias.map((tech) => (
                      <span key={tech} className={styles.tag}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.right}>
                  <div className={styles.match}>
                    <div className={styles.matchValue}>
                      {vaga.compatibilidade}
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