import { FaCalendar } from 'react-icons/fa6'
import Sidebar from '../../components/Sidebar/Sidebar'
import styles from './historicoVagas.module.css'

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

function HistoricoPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <Sidebar />

        <section className={styles.content}>
          <header className={styles.header}>
            <h1 className={styles.title}>Histórico de Vagas</h1>
            <p className={styles.subtitle}>
              Todas as vagas que você analisou
            </p>
          </header>

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
        </section>
      </section>
    </main>
  )
}

export default HistoricoPage