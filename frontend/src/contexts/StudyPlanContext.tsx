import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiGet, apiPatch } from '../services/api'

type TaskKind = 'subskill' | 'module'

type StudyTask = {
  id: string
  title: string
  done: boolean
  doneAt?: string
  kind: TaskKind
}

type SkillPlan = {
  id: string
  name: string
  priority: 'alta' | 'media' | 'baixa'
  tasks: StudyTask[]
}

type StudyPlanItemSkillResponse = {
  id: string
  skill_name: string
  reason?: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
}

type StudyPlanItemResponse = {
  id: string
  skill_name: string
  current_level?: string | null
  target_level: string
  priority: 'required' | 'desirable'
  reason?: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  subskills?: StudyPlanItemSkillResponse[]
}

type StudyPlanResponse = {
  id: string
  job_id: string
  status: string
  items: StudyPlanItemResponse[]
}

interface StudyPlanContextValue {
  plans: SkillPlan[]
  isLoading: boolean
  error: string
  reloadPlans: () => Promise<void>
  toggleTask: (planId: string, taskId: string) => void
}

const StudyPlanContext = createContext<StudyPlanContextValue | undefined>(undefined)

function mapPriority(priority: StudyPlanItemResponse['priority']): SkillPlan['priority'] {
  return priority === 'required' ? 'alta' : 'media'
}

function buildSubskillTitle(subskill: StudyPlanItemSkillResponse): string {
  if (subskill.reason?.trim()) {
    return `${subskill.skill_name}: ${subskill.reason.trim()}`
  }

  return subskill.skill_name
}

function buildModuleTitle(item: StudyPlanItemResponse): string {
  if (item.reason?.trim()) {
    return item.reason.trim()
  }

  const current = item.current_level ?? 'Beginner'
  return `Evoluir de ${current} para ${item.target_level}`
}

function mapItemTasks(item: StudyPlanItemResponse): StudyTask[] {
  const subskills = item.subskills ?? []
  if (subskills.length > 0) {
    return subskills.map((subskill) => ({
      id: subskill.id,
      title: buildSubskillTitle(subskill),
      done: subskill.status === 'completed',
      kind: 'subskill' as const,
    }))
  }

  return [
    {
      id: item.id,
      title: buildModuleTitle(item),
      done: item.status === 'completed',
      kind: 'module' as const,
    },
  ]
}

function mapApiPlans(apiPlans: StudyPlanResponse[]): SkillPlan[] {
  return apiPlans.flatMap((plan) =>
    plan.items.map((item) => ({
      id: item.id,
      name: item.skill_name,
      priority: mapPriority(item.priority),
      tasks: mapItemTasks(item),
    })),
  )
}

export function StudyPlanProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<SkillPlan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const reloadPlans = useCallback(async () => {
    const token = localStorage.getItem('access_token')?.trim()
    if (!token) {
      setPlans([])
      setIsLoading(false)
      setError('')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await apiGet<StudyPlanResponse[]>('/study-plans')
      setPlans(mapApiPlans(data))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Nao foi possivel carregar o plano de estudos.')
      setPlans([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reloadPlans()
    }, 0)

    const handleAuthChanged = () => {
      void reloadPlans()
    }

    window.addEventListener('auth-changed', handleAuthChanged)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('auth-changed', handleAuthChanged)
    }
  }, [reloadPlans])

  const toggleTask = useCallback((planId: string, taskId: string) => {
    const plan = plans.find((currentPlan) => currentPlan.id === planId)
    const task = plan?.tasks.find((currentTask) => currentTask.id === taskId)
    if (!task) {
      return
    }

    const nextDone = !task.done
    setPlans((currentPlans) =>
      currentPlans.map((currentPlan) =>
        currentPlan.id !== planId
          ? currentPlan
          : {
              ...currentPlan,
              tasks: currentPlan.tasks.map((currentTask) =>
                currentTask.id !== taskId
                  ? currentTask
                  : {
                      ...currentTask,
                      done: nextDone,
                      doneAt: nextDone ? new Date().toISOString() : undefined,
                    },
              ),
            },
      ),
    )

    const endpoint =
      task.kind === 'subskill'
        ? `/study-plans/item-skills/${taskId}/status`
        : `/study-plans/items/${taskId}/status`

    void apiPatch(endpoint, {
      status: nextDone ? 'completed' : 'pending',
    })
      .then(() => {
        // Completing every topic marks the module skill as known, so refresh
        // to reflect the updated module/skill state coming from the backend.
        void reloadPlans()
      })
      .catch(() => {
        void reloadPlans()
      })
  }, [plans, reloadPlans])

  const value = useMemo(
    () => ({ plans, isLoading, error, reloadPlans, toggleTask }),
    [plans, isLoading, error, reloadPlans, toggleTask],
  )

  return <StudyPlanContext.Provider value={value}>{children}</StudyPlanContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStudyPlan() {
  const context = useContext(StudyPlanContext)
  if (!context) {
    throw new Error('useStudyPlan must be used within StudyPlanProvider')
  }

  return context
}
