import { BookOpen, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStudyPlan } from '../../contexts/StudyPlanContext'

import PageContainer from '../../components/PageContainer/PageContainer'
import PageHeader from '../../components/PageHeader/PageHeader'

import LoadingState from '../../components/LoadingState/LoadingState'
import styles from './plano-estudos.module.css'

export default function PlanoEstudosPage() {
  const { plans, isLoading, error, reloadPlans, toggleTask } = useStudyPlan()
  const [openPlanId, setOpenPlanId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reloadPlans()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [reloadPlans])

  const totalTasks = plans.reduce((sum, plan) => sum + plan.tasks.length, 0)
  const completedTasks = plans.reduce(
    (sum, plan) => sum + plan.tasks.filter((task) => task.done).length,
    0,
  )
  const selectedOpenPlanId = openPlanId === undefined ? plans[0]?.id ?? '' : openPlanId

  return (
    <div className={styles.content}>
      <PageContainer className={styles.expandedContainer}>
        <div className={styles.pageStack}>
          <PageHeader
            title="Plano de Estudos"
            description="Plano personalizado baseado nas vagas que você analisou"
          />

          {isLoading ? <LoadingState message="Carregando plano de estudos" /> : null}
          {error ? <div className={styles.pageError}>{error}</div> : null}

          <section className={styles.summaryCards} aria-label="Resumo">
            <div className={`${styles.summaryCard} ${styles.cardGlass}`}>
              <div className={styles.summaryIconBox} aria-hidden="true">
                <ShieldCheck size={20} />
              </div>
              <div className={styles.summaryMeta}>
                <div className={styles.summaryBig}>{completedTasks}/{totalTasks}</div>
                <div className={styles.summarySmall}>Módulos concluídos</div>
              </div>
            </div>

            <div className={`${styles.summaryCard} ${styles.cardGlass}`}>
              <div className={styles.summaryIconBox} aria-hidden="true">
                <BookOpen size={20} />
              </div>
              <div className={styles.summaryMeta}>
                <div className={styles.summaryBig}>{plans.length}</div>
                <div className={styles.summarySmall}>Skills a desenvolver</div>
              </div>
            </div>
          </section>

          {!isLoading && plans.length === 0 ? (
            <section className={styles.emptyState} aria-label="Plano vazio">
              Nenhum plano de estudos gerado ainda.
            </section>
          ) : null}

          {plans.length > 0 ? (
            <section className={styles.skillsShell} aria-label="Plano de estudos">
              <div className={styles.skillPlanList}>
                {plans.map((plan) => {
                  const isOpen = plan.id === selectedOpenPlanId
                  const completedPlanTasks = plan.tasks.filter((task) => task.done).length
                  const progressPercentage = plan.tasks.length
                    ? Math.round((completedPlanTasks / plan.tasks.length) * 100)
                    : 0
                  const priorityClass =
                    plan.priority === 'media'
                      ? styles.priorityMedia
                      : styles[`priority${plan.priority}`]

                  return (
                    <div key={plan.id} className={styles.skillPlanCard}>
                      <button
                        type="button"
                        className={styles.skillPlanHeader}
                        onClick={() => setOpenPlanId(isOpen ? '' : plan.id)}
                      >
                        <div>
                          <span className={`${styles.skillBadge} ${priorityClass}`}>
                            Prioridade {plan.priority === 'media' ? 'média' : plan.priority}
                          </span>
                          <div className={styles.skillPlanTitle}>{plan.name}</div>
                        </div>

                        <div className={styles.skillPlanMeta}>
                          <span>{completedPlanTasks}/{plan.tasks.length} concluído</span>
                          <span className={styles.expandIcon}>{isOpen ? '-' : '+'}</span>
                        </div>
                      </button>

                      <div className={styles.progressTrack} aria-hidden="true">
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>

                      {isOpen && plan.tasks.length > 0 ? (
                        <div className={styles.skillTaskList}>
                          {plan.tasks.map((task) => (
                            <button
                              key={task.id}
                              type="button"
                              className={`${styles.skillTaskItem} ${task.done ? styles.taskDone : ''}`}
                              onClick={() => toggleTask(plan.id, task.id)}
                            >
                              {task.title}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </section>
          ) : null}
        </div>
      </PageContainer>
    </div>
  )
}
