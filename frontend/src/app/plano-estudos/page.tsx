import { AlertCircle, ArrowLeft, ArrowUpDown, BookOpen, Briefcase, Calendar, CheckCircle, Pencil, Search, ShieldCheck, Trash2 } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStudyPlan, type SkippedSkill, type StudyPlan, type StudyTask } from '../../contexts/StudyPlanContext'

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

const sortOptions: { value: 'recentes' | 'antigos' | 'titulo' | 'progresso'; label: string }[] = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'antigos', label: 'Mais antigos' },
  { value: 'titulo', label: 'Título (A-Z)' },
  { value: 'progresso', label: 'Progresso' },
]

type PlanCardProps = {
  plan: StudyPlan
  onOpen: () => void
  onOpenRename: () => void
  onOpenDeleteConfirm: () => void
  isBusy?: boolean
}

const PlanCard = memo(function PlanCard({
  plan,
  onOpen,
  onOpenRename,
  onOpenDeleteConfirm,
  isBusy = false,
}: PlanCardProps) {
  const { totalModules, completedModules, progress } = planStats(plan)

  const jobLabel = useMemo(() => [plan.jobTitle, plan.companyName].filter(Boolean).join(' · '), [
    plan.companyName,
    plan.jobTitle,
  ])

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
    >
      <header className={styles.planCardHeader}>
        <div className={styles.planCardTitleBlock}>
          <h3 className={styles.planCardTitle}>{plan.title}</h3>
        </div>

        <div className={styles.planCardActions}>
          <button
            type="button"
            className={styles.iconButton}
            disabled={isBusy}
            onClick={(e) => {
              e.stopPropagation()
              onOpenRename()
            }}
            aria-label="Renomear plano"
            title="Renomear"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
            disabled={isBusy}
            onClick={(e) => {
              e.stopPropagation()
              onOpenDeleteConfirm()
            }}
            aria-label="Excluir plano"
            title="Excluir"
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
})

function SkippedSkillsNotice({ skippedSkills }: { skippedSkills: SkippedSkill[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const s of skippedSkills) {
      const existing = map.get(s.planTitle) ?? []
      existing.push(s.skillName)
      map.set(s.planTitle, existing)
    }
    return map
  }, [skippedSkills])

  return (
    <section className={styles.skippedNotice} aria-label="Skills já presentes em outros planos">
      <div className={styles.skippedNoticeHeader}>
        <AlertCircle size={18} />
        <strong>Algumas skills da vaga já estão em outros planos</strong>
      </div>
      <p className={styles.skippedNoticeText}>
        Para evitar duplicação, as skills abaixo não foram incluídas neste plano porque já fazem parte de outro plano de estudos. Ao concluí-las no plano original, elas serão automaticamente marcadas como concluídas aqui também.
      </p>
      <ul className={styles.skippedList}>
        {Array.from(grouped.entries()).map(([planTitle, skills]) => (
          <li key={planTitle}>
            <strong>{skills.join(', ')}</strong>
            <span className={styles.skippedPlanRef}> — já em "{planTitle}"</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

type PlanDetailViewProps = {
  plan: StudyPlan
  openModuleId: string | undefined
  onOpenModule: (id: string | undefined) => void
  onBack: () => void
  onToggleTask: (planId: string, moduleId: string, taskId: string) => void
  isBusy: boolean
}

function PlanDetailView({ plan, openModuleId, onOpenModule, onBack, onToggleTask, isBusy }: PlanDetailViewProps) {
  const totalModules = plan.modules.length
  const completedModules = plan.modules.filter(
    (mod) => mod.tasks.length > 0 && mod.tasks.every((task) => task.done),
  ).length

  const jobLabel = useMemo(() => [plan.jobTitle, plan.companyName].filter(Boolean).join(' · '), [
    plan.companyName,
    plan.jobTitle,
  ])

  const selectedOpenModuleId = openModuleId === undefined ? plan.modules[0]?.id ?? '' : openModuleId

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

  const handleTaskClick = useCallback(
    (moduleId: string, task: StudyTask, moduleName: string, allTasks: StudyTask[]) => {
      if (task.done) return
      if (isBusy) return

      const pendingCount = allTasks.filter((t) => !t.done).length
      const isLastTask = pendingCount === 1

      setConfirmTarget({ moduleId, task, isLastTask, moduleName })
    },
    [isBusy],
  )

  const [isConfirmBusy, setIsConfirmBusy] = useState(false)

  const handleConfirm = useCallback(() => {
    if (!confirmTarget) return
    if (isConfirmBusy) return

    const { moduleId, task, isLastTask } = confirmTarget
    setConfirmTarget(null)
    setIsConfirmBusy(true)

    onToggleTask(plan.id, moduleId, task.id)

    if (isLastTask) setToast('Habilidade adicionada ao seu perfil')

    setIsConfirmBusy(false)
  }, [confirmTarget, isConfirmBusy, onToggleTask, plan.id])

  const handleCancel = useCallback(() => {
    setConfirmTarget(null)
  }, [])

  return (
    <div className={styles.content}>
      <PageContainer className={styles.expandedContainer}>
        <div className={styles.pageStack}>
          <button type="button" className={styles.backButton} onClick={onBack} disabled={isBusy}>
            <ArrowLeft size={16} />
            Voltar aos planos
          </button>

          <PageHeader title={plan.title} description={jobLabel || 'Plano personalizado de estudos'} />

          <section className={styles.summaryCards} aria-label="Resumo">
            <div className={`${styles.summaryCard} ${styles.cardGlass}`}>
              <div className={styles.summaryIconBox} aria-hidden="true">
                <ShieldCheck size={20} />
              </div>
              <div className={styles.summaryMeta}>
                <div className={styles.summaryBig}>
                  {completedModules}/{totalModules}
                </div>
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

          {plan.skippedSkills.length > 0 ? (
            <SkippedSkillsNotice skippedSkills={plan.skippedSkills} />
          ) : null}

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
                        disabled={isBusy}
                      >
                        <div>
                          <span className={`${styles.skillBadge} ${priorityClass}`}>
                            Prioridade {moduleEntry.priority === 'media' ? 'média' : moduleEntry.priority}
                          </span>
                          <div className={styles.skillPlanTitle}>{moduleEntry.name}</div>
                        </div>

                        <div className={styles.skillPlanMeta}>
                          <span>
                            {completedTasks}/{moduleEntry.tasks.length} concluído
                          </span>
                          <span className={styles.expandIcon}>{isOpen ? '-' : '+'}</span>
                        </div>
                      </button>

                      <div className={styles.progressTrack} aria-hidden="true">
                        <div className={styles.progressFill} style={{ width: `${progressPercentage}%` }} />
                      </div>

                      {isOpen && moduleEntry.tasks.length > 0 ? (
                        <div className={styles.skillTaskList}>
                          {moduleEntry.tasks.map((task) => (
                            <button
                              key={task.id}
                              type="button"
                              className={`${styles.skillTaskItem} ${task.done ? styles.taskDone : ''}`}
                              onClick={() =>
                                handleTaskClick(moduleEntry.id, task, moduleEntry.name, moduleEntry.tasks)
                              }
                              disabled={task.done || isBusy}
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
              <button
                type="button"
                className={styles.confirmButtonConfirm}
                onClick={handleConfirm}
                disabled={isConfirmBusy || isBusy}
              >
                {isConfirmBusy ? 'Confirmando...' : 'Confirmar'}
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

export default function PlanoEstudosPage() {
  const { plans, isLoading, error, reloadPlans, toggleTask, renamePlan, deletePlan } = useStudyPlan()

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [openModuleId, setOpenModuleId] = useState<string | undefined>(undefined)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [editingPlanTitle, setEditingPlanTitle] = useState('')
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [renameError, setRenameError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'recentes' | 'antigos' | 'titulo' | 'progresso'>('recentes')
  const [isOpenSortDropdown, setIsOpenSortDropdown] = useState(false)
  const sortDropdownRef = useRef<HTMLLabelElement | null>(null)

  useEffect(() => {
    if (!isOpenSortDropdown) return

    const handleClickOutside = (event: MouseEvent) => {
      const element = sortDropdownRef.current
      if (!element || element.contains(event.target as Node)) return
      setIsOpenSortDropdown(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpenSortDropdown])

  const filteredPlans = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    const filtered = !term
      ? plans
      : plans.filter((plan) => {
          const haystack = [plan.title, plan.jobTitle, plan.companyName]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          return haystack.includes(term)
        })

    const getDateValue = (value: string) => {
      const time = new Date(value).getTime()
      return Number.isFinite(time) ? time : 0
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'recentes') return getDateValue(b.createdAt) - getDateValue(a.createdAt)
      if (sortBy === 'antigos') return getDateValue(a.createdAt) - getDateValue(b.createdAt)
      if (sortBy === 'titulo')
        return a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })

      // progresso (maior para menor)
      return planStats(b).progress - planStats(a).progress
    })

    return sorted
  }, [plans, searchTerm, sortBy])


  const selectedPlan = useMemo(() => {
    return plans.find((plan) => plan.id === selectedPlanId) ?? null
  }, [plans, selectedPlanId])


  const { totalPlans, completedPlans } = useMemo(() => {
    const total = plans.length
    let completed = 0
    for (const p of plans) {
      const s = planStats(p)
      if (s.totalModules > 0 && s.completedModules === s.totalModules) completed += 1
    }
    return { totalPlans: total, completedPlans: completed }
  }, [plans])


  const loadingMessage = useMemo(() => {
    return 'Carregando planos de estudo...'
  }, [])


  const didInitialReload = useRef(false)
  useEffect(() => {
    if (didInitialReload.current) return
    didInitialReload.current = true
    void reloadPlans()
  }, [reloadPlans])

  useEffect(() => {
    const jobId = searchParams.get('jobId')
    if (!jobId) return

    const match = plans.find((p) => p.jobId === jobId)
    if (!match) return

    setSelectedPlanId((prev) => (prev === match.id ? prev : match.id))

    const next = new URLSearchParams(searchParams)
    next.delete('jobId')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, searchParams, setSearchParams])

  const isPageBusy = isLoading
  const currentEditingPlan = editingPlanId ? plans.find((plan) => plan.id === editingPlanId) : null
  const currentDeletingPlan = deletingPlanId ? plans.find((plan) => plan.id === deletingPlanId) : null

  const dismissToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(dismissToast, 4000)
    return () => window.clearTimeout(timer)
  }, [toast, dismissToast])

  if (isLoading) {
    return (
      <div className={styles.content}>
        <LoadingState message={loadingMessage} />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.content}>
        <section className={styles.pageError} aria-label="Erro ao carregar">
          {error}
        </section>
      </div>
    )
  }

  return (
    <div className={styles.content}>
      {selectedPlan ? (
        <PlanDetailView
          plan={selectedPlan}
          openModuleId={openModuleId}
          onOpenModule={(id) => setOpenModuleId(id ? id : undefined)}
          onBack={() => {
            setSelectedPlanId(null)
            setOpenModuleId(undefined)
          }}
          onToggleTask={(planId, moduleId, taskId) => toggleTask(planId, moduleId, taskId)}
          isBusy={isPageBusy}
        />
      ) : (
        <PageContainer className={styles.expandedContainer}>
          <div className={styles.pageStack}>
            <PageHeader
              title="Planos de estudo"
              description={
                totalPlans > 0
                  ? `${completedPlans}/${totalPlans} planos concluídos`
                  : 'Crie e gerencie seus planos de estudo'
              }
            />

            {/* Bloco de cards glass de contagem */}
            <section className={styles.summaryCards} aria-label="Resumo do progresso">

              <div className={`${styles.summaryCard} ${styles.cardGlass}`}>
                <div className={styles.summaryIconBox} aria-hidden="true">
                  <ShieldCheck size={20} />
                </div>
                <div className={styles.summaryMeta}>
                  <div className={styles.summaryBig}>{completedPlans}</div>
                  <div className={styles.summarySmall}>Planos concluídos</div>
                </div>
              </div>

              <div className={`${styles.summaryCard} ${styles.cardGlass}`}>
                <div className={styles.summaryIconBox} aria-hidden="true">
                  <BookOpen size={20} />
                </div>
                <div className={styles.summaryMeta}>
                  <div className={styles.summaryBig}>{totalPlans - completedPlans}</div>
                  <div className={styles.summarySmall}>Planos em desenvolvimento</div>
                </div>
              </div>
            </section>

            {/* Bloco de filtros */}
            <div className={styles.toolbar}>
              <div className={styles.searchField}>
                <span className={styles.searchIcon} aria-hidden="true">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                  placeholder="Buscar por título, cargo ou empresa..."
                  aria-label="Buscar planos"
                />
              </div>

              <label
                ref={sortDropdownRef}
                className={styles.sortField}
                role="button"
                tabIndex={0}
                aria-label="Ordenar planos"
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
                  {sortOptions.find((option) => option.value === sortBy)?.label ?? ''}
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
              {/* (A lista já está filtrada/ordenada via filteredPlans) */}

            <section className={styles.planGrid} aria-label="Lista de planos">
              {filteredPlans.length === 0 ? (

                <section className={styles.emptyState} aria-label="Nenhum plano">
                  Você ainda não possui planos de estudo.
                </section>
              ) : (
                filteredPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}

                    isBusy={isPageBusy || actionBusy}
                    onOpen={() => {
                      setSelectedPlanId(plan.id)
                      setOpenModuleId(undefined)
                    }}
                    onOpenRename={() => {
                      setEditingPlanId(plan.id)
                      setEditingPlanTitle(plan.title)
                      setRenameError(null)
                    }}
                    onOpenDeleteConfirm={() => {
                      setDeletingPlanId(plan.id)
                    }}
                  />
                ))
              )}
            </section>
          </div>
        </PageContainer>
      )}


      {editingPlanId && currentEditingPlan ? (
        <div className={styles.confirmOverlay} onClick={() => !actionBusy && setEditingPlanId(null)}>
          <div className={styles.confirmCard} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3 className={styles.confirmTitle}>Renomear plano</h3>
            <p className={styles.confirmDescription}>Atualize o nome do plano de estudo.</p>
            <input
              value={editingPlanTitle}
              onChange={(event) => {
                setEditingPlanTitle(event.target.value)
                setRenameError(null)
              }}
              className={styles.renameInput}
              aria-label="Título do plano"
              disabled={actionBusy}
            />
            {renameError ? <div className={styles.renameError}>{renameError}</div> : null}
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmButtonCancel}
                onClick={() => setEditingPlanId(null)}
                disabled={actionBusy}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.confirmButtonConfirm}
                onClick={async () => {
                  if (!editingPlanTitle.trim()) {
                    setRenameError('O título não pode ficar vazio.')
                    return
                  }

                  if (!editingPlanId) return
                  setActionBusy(true)
                  try {
                    await renamePlan(editingPlanId, editingPlanTitle.trim())
                    setToast('Plano renomeado com sucesso')
                    setEditingPlanId(null)
                  } catch {
                    setRenameError('Falha ao renomear o plano. Tente novamente.')
                  } finally {
                    setActionBusy(false)
                  }
                }}
                disabled={actionBusy}
              >
                {actionBusy ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deletingPlanId && currentDeletingPlan ? (
        <div className={styles.confirmOverlay} onClick={() => !actionBusy && setDeletingPlanId(null)}>
          <div className={styles.confirmCard} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className={styles.confirmIcon}>
              <Trash2 size={32} />
            </div>
            <h3 className={styles.confirmTitle}>Excluir plano</h3>
            <p className={styles.confirmDescription}>
              Tem certeza que deseja remover o plano "{currentDeletingPlan.title}"? Esta ação não pode ser desfeita.
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmButtonCancel}
                onClick={() => setDeletingPlanId(null)}
                disabled={actionBusy}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.confirmButtonConfirm}
                onClick={async () => {
                  if (!deletingPlanId) return
                  setActionBusy(true)
                  try {
                    await deletePlan(deletingPlanId)
                    setToast('Plano excluído com sucesso')
                    setDeletingPlanId(null)
                  } catch {
                    setToast('Falha ao excluir o plano. Tente novamente.')
                  } finally {
                    setActionBusy(false)
                  }
                }}
                disabled={actionBusy}
              >
                {actionBusy ? 'Excluindo...' : 'Excluir'}
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

