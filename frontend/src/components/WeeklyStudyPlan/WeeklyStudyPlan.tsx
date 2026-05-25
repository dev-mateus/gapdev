import { Calendar, TrendingUp } from 'lucide-react'
import styles from './weekly-study-plan.module.css'

interface WeeklyStudyPlanProps {
  dataInicio: string // formato 'AAAA-MM-DD'
  titulo?: string
  descricao?: string
}

export default function WeeklyStudyPlan({
  dataInicio,
}: WeeklyStudyPlanProps) {
  // Calcular data de início e hoje
  const startDate = new Date(dataInicio)
  const today = new Date()

  // Normalizar as datas para comparação correta (sem horas)
  startDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  // Calcular dias passados
  const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Calcular semana atual (começa em 1)
  const currentWeekNumber = Math.floor(daysPassed / 7) + 1

  // Calcular dia dentro da semana atual (1-7)
  const dayInCurrentWeek = (daysPassed % 7) + 1

  // Calcular porcentagem de progresso da semana atual
  const weekProgress = Math.round((dayInCurrentWeek / 7) * 100)

  // Dados das 4 semanas
  const weeks = [
    { number: 1, label: 'Semana 1' },
    { number: 2, label: 'Semana 2' },
    { number: 3, label: 'Semana 3' },
    { number: 4, label: 'Semana 4' },
  ]

  // Calcular progresso de cada semana
  const getWeekProgress = (weekNumber: number) => {
    if (weekNumber < currentWeekNumber) {
      return 100 // Semanas passadas estão 100% completas
    }
    if (weekNumber === currentWeekNumber) {
      return weekProgress // Semana atual mostra progresso do dia
    }
    return 0 // Semanas futuras estão em 0%
  }

  const getWeekStatus = (weekNumber: number) => {
    if (weekNumber < currentWeekNumber) {
      return 'concluída'
    }
    if (weekNumber === currentWeekNumber) {
      return 'em andamento'
    }
    return 'futura'
  }

  return (
    <div className={styles.container}>
      {/* Summary Cards */}
      <section className={styles.summaryCards} aria-label="Resumo do progresso">
        <div className={`${styles.summaryCard} ${styles.cardGlass}`}>
          <div className={styles.summaryIconBox} aria-hidden="true">
            <Calendar size={20} />
          </div>
          <div className={styles.summaryMeta}>
            <div className={styles.summaryBig}>{daysPassed}</div>
            <div className={styles.summarySmall}>Dias decorridos</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardGlass}`}>
          <div className={styles.summaryIconBox} aria-hidden="true">
            <TrendingUp size={20} />
          </div>
          <div className={styles.summaryMeta}>
            <div className={styles.summaryBig}>Semana {currentWeekNumber}</div>
            <div className={styles.summarySmall}>Dia {dayInCurrentWeek} de 7</div>
          </div>
        </div>
      </section>

      {/* Skills Shell com Semanas */}
      <section className={styles.skillsShell} aria-label="Plano de estudos por semana">
        <div className={styles.skillPlanList}>
          {weeks.map((week) => {
            const progress = getWeekProgress(week.number)
            const status = getWeekStatus(week.number)
            const isComplete = progress === 100
            const isCurrent = week.number === currentWeekNumber

            return (
              <div key={week.number} className={styles.skillPlanCard}>
                <div className={styles.skillPlanHeader}>
                  <div>
                    <span
                      className={`${styles.skillBadge} ${
                        status === 'concluída'
                          ? styles.prioritybaixa
                          : status === 'em andamento'
                            ? styles.priorityMedia
                            : styles.priorityalta
                      }`}
                    >
                      {status === 'concluída' ? '✓ Concluída' : status === 'em andamento' ? '⏳ Em andamento' : 'Futura'}
                    </span>
                    <div className={styles.skillPlanTitle}>{week.label}</div>
                  </div>

                  <div className={styles.skillPlanMeta}>
                    <span>{progress}% concluído</span>
                    <span className={styles.expandIcon}>■</span>
                  </div>
                </div>

                <div className={styles.progressTrack} aria-hidden="true">
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${progress}%`,
                      transition: isCurrent ? 'width 300ms ease' : 'width 400ms ease',
                    }}
                    data-status={status}
                  />
                </div>

                {isCurrent && (
                  <div className={styles.weekDetails}>
                    <p className={styles.weekDetailsText}>
                      Você está no <strong>dia {dayInCurrentWeek}</strong> desta semana.
                      {dayInCurrentWeek === 7 && ' Última semana em andamento!'}
                    </p>
                  </div>
                )}

                {isComplete && (
                  <div className={styles.weekCompleteMessage}>
                    <p className={styles.weekCompleteText}>✓ Semana completada com sucesso!</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
