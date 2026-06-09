import { ArrowLeft, BookOpen, Briefcase, Calendar, CheckCircle, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStudyPlan, type StudyPlan, type StudyTask } from '../../contexts/StudyPlanContext'

import PageContainer from '../../components/PageContainer/PageContainer'
import PageHeader from '../../components/PageHeader/PageHeader'

import LoadingState from '../../components/LoadingState/LoadingState'
import styles from './plano-estudos.module.css'

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

function planStats(plan: StudyPlan) {
  const totalModules = plan.modules.length
  const completedModules = plan.modules.filter(
    (mod) => mod.tasks.length > 0 && mod.tasks.every((task) => task.done),
  ).length
  const progress = totalModules ? Math.round((completedModules / totalModules) * 100) : 0
  return { totalModules, completedModules, progress }
}

export default function PlanoEstudosPage() {
  const { plans, isLoading, error, reloadPlans, toggleTask, renamePlan, deletePlan } = useStudyPlan()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [openModuleId, setOpenModuleId] = useState<string | undefined>(undefined)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reloadPlans()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [reloadPlans])

  // Auto-open the plan that matches the ?jobId coming from "Gerar plano".
  useEffect(() => {
    const jobId = searchParams.get('jobId')
    if (!jobId || plans.length === 0) return
    const match = plans.find((p) => p.jobId === jobId)
    if (match) {
      setSelectedPlanId(match.id)
      searchParams.delete('jobId')
      setSearchParams(searchParams, { replace: true })
    }
  }, [plans, searchParams, setSearchParams])

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  )

  if (selectedPlan) {
    return (
      <PlanDetailView
        plan={selectedPlan}
        openModuleId={openModuleId}
        onOpenModule={setOpenModuleId}
        onBack={() => {
          setSelectedPlanId(null)
          setOpenModuleId(undefined)
        }}
        onToggleTask={toggleTask}
      />
    )
  }

  const totalPlans = plans.length
  const completedPlans = plans.filter((plan) => {
    const { totalModules, completedModules } = planStats(plan)
    return totalModules > 0 && completedModules === totalModules
  }).length

  return (
    <div className={styles.content}>
      <PageContainer className={styles.expandedContainer}>
        <div className={styles.pageStack}>
          <PageHeader
            title="Plano de Estudos"
            description="Cada vaga analisada gera um plano separado. Selecione um para ver os módulos."
          />

          {isLoading ? <LoadingState message="Carregando planos de estudo" /> : null}
          {error ? <div className={styles.pageError}>{error}</div> : null}

          <section className={styles.summaryCards} aria-label="Resumo">
            <div className={`${styles.summaryCard} ${styles.cardGlass}`}>
              <div className={styles.summaryIconBox} aria-hidden="true">
                <BookOpen size={20} />
              </div>
              <div className={styles.summaryMeta}>
                <div className={styles.summaryBig}>{totalPlans}</div>
                <div className={styles.summarySmall}>Planos gerados</div>
              </div>
            </div>

            <div className={`${styles.summaryCard} ${styles.cardGlass}`}>
              <div className={styles.summaryIconBox} aria-hidden="true">
                <ShieldCheck size={20} />
              </div>
              <div className={styles.summaryMeta}>
                <div className={styles.summaryBig}>{completedPlans}/{totalPlans}</div>
                <div className={styles.summarySmall}>Planos concluídos</div>
              </div>
            </div>
          </section>

          {!isLoading && plans.length === 0 ? (
            <section className={styles.emptyState} aria-label="Plano vazio">
              Nenhum plano de estudos gerado ainda. Analise uma vaga para gerar o primeiro.
            </section>
          ) : null}

          {plans.length > 0 ? (
            <section className={styles.planGrid} aria-label="Planos de estudo">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onOpen={() => setSelectedPlanId(plan.id)}
                  onRename={async (title) => {
                    await renamePlan(plan.id, title)
                  }}
                  onDelete={async () => {
                    await deletePlan(plan.id)
                  }}
                />
              ))}
            </section>
          ) : null}
        </div>
      </PageContainer>
    </div>
  )
}

type PlanCardProps = {
  plan: StudyPlan
  onOpen: () => void
  onRename: (title: string) => Promise<void>
  onDelete: () => Promise<void>
}

function PlanCard({ plan, onOpen, onRename, onDelete }: PlanCardProps) {
  const { totalModules, completedModules, progress } = planStats(plan)
  const [isBusy, setIsBusy] = useState(false)

  const jobLabel = [plan.jobTitle, plan.companyName].filter(Boolean).join(' · ')

  const handleRename = async (event: React.MouseEvent) => {
    event.stopPropagation()
    const next = window.prompt('Novo nome do plano:', plan.title)
    if (!next || next.trim() === plan.title) return
    setIsBusy(true)
    try {
      await onRename(next.trim())
    } finally {
      setIsBusy(false)
    }
  }

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation()
    const ok = window.confirm(`Excluir o plano "${plan.title}"? Esta ação não pode ser desfeita.`)
    if (!ok) return
    setIsBusy(true)
    try {
      await onDelete()
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <article
      className={styles.planCard}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen()
        }
      }}
      aria-busy={isBusy}
    >
      <header className={styles.planCardHeader}>
        <h3 className={styles.planCardTitle}>{plan.title}</h3>
        <div className={styles.planCardActions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={handleRename}
            aria-label="Renomear plano"
            title="Renomear"
            disabled={isBusy}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
            onClick={handleDelete}
            aria-label="Excluir plano"
            title="Excluir"
            disabled={isBusy}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {jobLabel ? (
        <div className={styles.planCardMetaLine}>
          <Briefcase size={14} />
          <span>{jobLabel}</span>
        </div>
      ) : null}

      <div className={styles.planCardMetaLine}>
        <Calendar size={14} />
        <span>Criado em {formatDate(plan.createdAt)}</span>
      </div>

      <div className={styles.planCardProgressBlock}>
        <div className={styles.planCardProgressLabels}>
          <span>{progress}% concluído</span>
          <span>
            {completedModules}/{totalModules} módulos
          </span>
        </div>
        <div className={styles.progressTrack} aria-hidden="true">
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </article>
  )
}

type PlanDetailViewProps = {
  plan: StudyPlan
  openModuleId: string | undefined
  onOpenModule: (id: string | undefined) => void
  onBack: () => void
  onToggleTask: (planId: string, moduleId: string, taskId: string) => void
}

function PlanDetailView({ plan, openModuleId, onOpenModule, onBack, onToggleTask }: PlanDetailViewProps) {
  const totalModules = plan.modules.length
  const completedModules = plan.modules.filter(
    (mod) => mod.tasks.length > 0 && mod.tasks.every((task) => task.done),
  ).length
  const selectedOpenModuleId = openModuleId === undefined ? plan.modules[0]?.id ?? '' : openModuleId
  const jobLabel = [plan.jobTitle, plan.companyName].filter(Boolean).join(' · ')

  const [confirmTarget, setConfirmTarget] = useState<{
    moduleId: string
    task: StudyTask
    isLastTask: boolean
    moduleName: string
  } | null>(null)

  const [toast, setToast] = useState<string | null>(null)

  const dismissToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(dismissToast, 4000)
    return () => window.clearTimeout(timer)
  }, [toast, dismissToast])

  const handleTaskClick = (moduleId: string, task: StudyTask, moduleName: string, allTasks: StudyTask[]) => {
    if (task.done) return

    const pendingCount = allTasks.filter((t) => !t.done).length
    const isLastTask = pendingCount === 1

    setConfirmTarget({ moduleId, task, isLastTask, moduleName })
  }

  const handleConfirm = () => {
    if (!confirmTarget) return

    onToggleTask(plan.id, confirmTarget.moduleId, confirmTarget.task.id)

    if (confirmTarget.isLastTask) {
      setToast('Habilidade adicionada ao seu perfil')
    }

    setConfirmTarget(null)
  }

  const handleCancel = () => {
    setConfirmTarget(null)
  }

  return (
    <div className={styles.content}>
      <PageContainer className={styles.expandedContainer}>
        <div className={styles.pageStack}>
          <button type="button" className={styles.backButton} onClick={onBack}>
            <ArrowLeft size={16} />
            Voltar aos planos
          </button>

          <PageHeader
            title={plan.title}
            description={jobLabel || 'Plano personalizado de estudos'}
          />

          <section className={styles.summaryCards} aria-label="Resumo">
            <div className={`${styles.summaryCard} ${styles.cardGlass}`}>
              <div className={styles.summaryIconBox} aria-hidden="true">
                <ShieldCheck size={20} />
              </div>
              <div className={styles.summaryMeta}>
                <div className={styles.summaryBig}>{completedModules}/{totalModules}</div>
                <div className={styles.summarySmall}>Módulos concluídos</div>
              </div>
            </div>

            <div className={`${styles.summaryCard} ${styles.cardGlass}`}>
              <div className={styles.summaryIconBox} aria-hidden="true">
                <BookOpen size={20} />
              </div>
              <div className={styles.summaryMeta}>
                <div className={styles.summaryBig}>{totalModules}</div>
                <div className={styles.summarySmall}>Skills a desenvolver</div>
              </div>
            </div>
          </section>

          {plan.modules.length === 0 ? (
            <section className={styles.emptyState} aria-label="Plano vazio">
              Nenhum módulo neste plano — você já domina todas as skills exigidas pela vaga.
            </section>
          ) : (
            <section className={styles.skillsShell} aria-label="Módulos do plano">
              <div className={styles.skillPlanList}>
                {plan.modules.map((moduleEntry) => {
                  const isOpen = moduleEntry.id === selectedOpenModuleId
                  const completedTasks = moduleEntry.tasks.filter((task) => task.done).length
                  const progressPercentage = moduleEntry.tasks.length
                    ? Math.round((completedTasks / moduleEntry.tasks.length) * 100)
                    : 0
                  const priorityClass =
                    moduleEntry.priority === 'media'
                      ? styles.priorityMedia
                      : styles[`priority${moduleEntry.priority}`]

                  return (
                    <div key={moduleEntry.id} className={styles.skillPlanCard}>
                      <button
                        type="button"
                        className={styles.skillPlanHeader}
                        onClick={() => onOpenModule(isOpen ? '' : moduleEntry.id)}
                      >
                        <div>
                          <span className={`${styles.skillBadge} ${priorityClass}`}>
                            Prioridade {moduleEntry.priority === 'media' ? 'média' : moduleEntry.priority}
                          </span>
                          <div className={styles.skillPlanTitle}>{moduleEntry.name}</div>
                        </div>

                        <div className={styles.skillPlanMeta}>
                          <span>{completedTasks}/{moduleEntry.tasks.length} concluído</span>
                          <span className={styles.expandIcon}>{isOpen ? '-' : '+'}</span>
                        </div>
                      </button>

                      <div className={styles.progressTrack} aria-hidden="true">
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>

                      {isOpen && moduleEntry.tasks.length > 0 ? (
                        <div className={styles.skillTaskList}>
                          {moduleEntry.tasks.map((task) => (
                            <button
                              key={task.id}
                              type="button"
                              className={`${styles.skillTaskItem} ${task.done ? styles.taskDone : ''}`}
                              onClick={() => handleTaskClick(moduleEntry.id, task, moduleEntry.name, moduleEntry.tasks)}
                              disabled={task.done}
                            >
                              {task.done ? <CheckCircle size={16} className={styles.taskDoneIcon} /> : null}
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
          )}
        </div>
      </PageContainer>

      {confirmTarget ? (
        <div className={styles.confirmOverlay} onClick={handleCancel}>
          <div className={styles.confirmCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              <CheckCircle size={32} />
            </div>
            <h3 className={styles.confirmTitle}>
              {confirmTarget.isLastTask
                ? `Concluir módulo "${confirmTarget.moduleName}"?`
                : 'Concluir subskill?'}
            </h3>
            <p className={styles.confirmDescription}>
              {confirmTarget.isLastTask
                ? 'Ao concluir este último item, o módulo será finalizado e a habilidade será adicionada ao seu perfil. Esta ação não pode ser desfeita.'
                : `Deseja marcar "${confirmTarget.task.title}" como concluído? Esta ação não pode ser desfeita.`}
            </p>
            <div className={styles.confirmActions}>
              <button type="button" className={styles.confirmButtonCancel} onClick={handleCancel}>
                Cancelar
              </button>
              <button type="button" className={styles.confirmButtonConfirm} onClick={handleConfirm}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={styles.toast} onClick={dismissToast}>
          <CheckCircle size={18} />
          <span>{toast}</span>
        </div>
      ) : null}
    </div>
  )
}
