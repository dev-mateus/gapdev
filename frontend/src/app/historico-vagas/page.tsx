import { useState } from 'react'
import { Menu } from 'lucide-react'
import { FaCalendar } from 'react-icons/fa6'

import Sidebar from '../../components/Sidebar/Sidebar'
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
    status: 'Analisada',
    compatibilidade: '8%',
    tecnologias: ['Node.js', 'NestJS', 'PostgreSQL', 'MySQL', 'Git'],
  },
  {
    id: 2,
    titulo: 'Frontend React Developer',
    data: '05/04/2026',
    status: 'Analisada',
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  function handleTabChange(tab: TabSwitcherItem) {
    if (!tab.href) return
    navigateTo(tab.href)
  }

  return (
    <div className="app-layout">
      {!isSidebarOpen && (
        <button className="menu-button" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={`app-content ${styles.content}`}>
        <PageContainer className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>Histórico de Vagas</h1>
            <p className={styles.subtitle}>
              Todas as vagas que você analisou
            </p>
          </header>

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
                  <span className={styles.status}>{vaga.status}</span>

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
        </PageContainer>
      </main>
    </div>
  )
}

export default HistoricoPage