import { useStudyPlan } from '../../contexts/StudyPlanContext'
import PageHeader from '../../components/PageHeader/PageHeader'
import PageContainer from '../../components/PageContainer/PageContainer'
import styles from './progresso.module.css'

type WeeklyData = {
  label: string
  completed: number
  total: number
}

type SkillProgress = {
  name: string
  percent: number
  status: 'em andamento' | 'iniciando' | 'concluído'
}

function formatPercentBR(value: number) {
  return `${value.toFixed(2).replace('.', ',')}%`
}

export default function ProgressoPage() {
  const { plans } = useStudyPlan()

  const allTasks = plans.flatMap((plan) =>
    plan.tasks.map((task) => ({
      ...task,
      planId: plan.id,
      planName: plan.name,
    })),
  )

  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter((task) => task.done).length
  const totalSkills = plans.length
  const dominatedSkills = plans.filter((plan) => plan.tasks.length > 0 && plan.tasks.every((task) => task.done)).length
  const dominatedPercent = totalSkills > 0 ? Math.round((dominatedSkills / totalSkills) * 100) : 0

  const skillProgress: SkillProgress[] = plans.map((plan) => {
    const completedPlanTasks = plan.tasks.filter((task) => task.done).length
    const percent = plan.tasks.length ? Math.round((completedPlanTasks / plan.tasks.length) * 100) : 0
    const status = percent >= 100 ? 'concluído' : percent >= 40 ? 'em andamento' : 'iniciando'

    return {
      name: plan.name,
      percent,
      status,
    }
  })

  const weeksCount = 4

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 7 * (weeksCount - 1))

  const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const currentWeekNumber = Math.floor(daysPassed / 7) + 1
  const dayInCurrentWeek = (daysPassed % 7) + 1

  const currentWeekIndex = currentWeekNumber - 1
  const weeklyData: WeeklyData[] = Array.from({ length: weeksCount }, (_, index) => {
    const isPast = index < currentWeekIndex
    const isCurrent = index === currentWeekIndex

    const total = 7
    const completed = isPast ? total : isCurrent ? Math.min(dayInCurrentWeek, total) : 0

    return {
      label: `Semana ${index + 1}`,
      completed,
      total,
    }
  })

  let currentStreak = 0
  for (let index = weeklyData.length - 1; index >= 0; index -= 1) {
    if (weeklyData[index].completed > 0) {
      currentStreak += 1
    } else {
      break
    }
  }

  return (
    <div className={styles.content}>
      <PageContainer className={styles.expandedContainer}>
        <div className={styles.page}>
          <PageHeader
            title="Progresso"
            description="Visualize seu crescimento usando os dados do plano de estudos"
          />

          <section className={styles.cards} aria-label="Resumo do progresso">
            <div className={`${styles.card} ${styles.cardGlass}`}>
              <div className={styles.cardTop}>
                <div className={styles.cardIcon} aria-hidden="true">
                  ✓
                </div>
                <div className={styles.cardMeta}>
                  <h3 className={styles.cardTitle}>Conteúdos concluídos</h3>
                  <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{completedTasks}/{totalTasks}</span>
                    <span className={styles.badgePlus}>Baseado no plano de estudos</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.card} ${styles.cardGlass}`}>
              <div className={styles.cardTop}>
                <div className={styles.ringWrap}>
                  <div className={styles.ring}>
                    <div
                      className={styles.ringFill}
                      style={{ ['--ring-progress' as any]: `${dominatedPercent}%` }}
                    />
                  </div>
                  <div className={styles.ringCenter}>
                    <div className={styles.ringNumber}>
                      {dominatedSkills}/{totalSkills}
                    </div>
                    <div className={styles.ringSub}>{formatPercentBR(dominatedPercent)} completo</div>
                  </div>
                </div>

                <div className={styles.cardMeta}>
                  <h3 className={styles.cardTitle}>Skills dominadas</h3>
                </div>
              </div>
            </div>

            <div className={`${styles.card} ${styles.cardGlass}`}>
              <div className={styles.cardTop}>
                <div className={styles.cardIcon} aria-hidden="true">
                  ▣
                </div>
                <div className={styles.cardMeta}>
                  <h3 className={styles.cardTitle}>Sequência atual</h3>
                  <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{currentStreak}</span>
                    <span className={styles.badgeRecord}>Semanas com progresso recente</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className={styles.grid}>
            <section className={`${styles.panel} ${styles.panelGlass}`}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Progresso semanal</h2>
                <p className={styles.panelSubtitle}>Semanas calculadas a partir das tarefas do plano de estudos</p>
              </div>

              <div className={styles.bars} role="img" aria-label="Gráfico de barras semanal">
                {weeklyData.map((week) => {
                  const heightPercent = week.total > 0 ? (week.completed / week.total) * 100 : 0

                  return (
                    <div key={week.label} className={styles.barCol}>
                      <div className={styles.barWrap}>
                        <div
                          className={styles.bar}
                          style={{ height: `${heightPercent}%`, ['--bar-value' as any]: week.completed }}
                        />
                        <div className={styles.barValue}>{week.completed}/{week.total}</div>
                      </div>
                      <div className={styles.barLabel}>{week.label}</div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className={`${styles.panel} ${styles.panelGlass}`}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Progresso por skill</h2>
                <p className={styles.panelSubtitle}>Dados extraídos diretamente do plano de estudos</p>
              </div>

              <div className={styles.skillList}>
                {skillProgress.map((skill) => {
                  const isDone = skill.percent >= 100

                  return (
                    <div key={skill.name} className={styles.skillRow}>
                      <div className={styles.skillTop}>
                        <div className={styles.skillName}>
                          {skill.name}
                          {isDone ? <span className={styles.check} aria-label="Concluído">✓</span> : null}
                        </div>
                        <div className={styles.skillPercent}>{skill.percent}%</div>
                      </div>

                      <div className={styles.progressTrack} aria-hidden="true">
                        <div
                          className={styles.progressFill}
                          style={{ width: `${skill.percent}%` }}
                          data-done={isDone ? 'true' : 'false'}
                        />
                      </div>

                      <div className={styles.skillStatus}>
                        {skill.status === 'concluído'
                          ? 'Concluído'
                          : skill.status === 'iniciando'
                            ? 'Iniciando'
                            : 'Em andamento'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}

