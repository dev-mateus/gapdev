import { createContext, useContext, useMemo, useState, useEffect } from 'react'

type StudyTask = {
  id: string
  title: string
  done: boolean
}

type SkillPlan = {
  id: string
  name: string
  priority: 'alta' | 'media' | 'baixa'
  tasks: StudyTask[]
}

const initialPlans: SkillPlan[] = [
  {
    id: 'docker',
    name: 'Docker',
    priority: 'alta',
    tasks: [
      { id: 'docker-1', title: 'Fundamentos de Cloud Computing', done: true },
      { id: 'docker-2', title: 'Serviços principais da AWS', done: false },
      { id: 'docker-3', title: 'Deploy com EC2 e S3', done: false },
    ],
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    priority: 'media',
    tasks: [
      { id: 'graphql-1', title: 'Introdução ao GraphQL', done: false },
      { id: 'graphql-2', title: 'Esquemas e resolvers', done: false },
      { id: 'graphql-3', title: 'Queries e Mutations', done: false },
      { id: 'graphql-4', title: 'Integração com frontend', done: false },
    ],
  },
  {
    id: 'aws',
    name: 'AWS',
    priority: 'baixa',
    tasks: [
      { id: 'aws-1', title: 'Fundamentos de Cloud Computing', done: true },
      { id: 'aws-2', title: 'Serviços principais da AWS', done: false },
      { id: 'aws-3', title: 'Deploy com EC2 e S3', done: false },
    ],
  },
]

const STORAGE_KEY = 'gapdev-study-plan'

interface StudyPlanContextValue {
  plans: SkillPlan[]
  toggleTask: (planId: string, taskId: string) => void
}

const StudyPlanContext = createContext<StudyPlanContextValue | undefined>(undefined)

export function StudyPlanProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<SkillPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : initialPlans
    } catch {
      return initialPlans
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
    } catch {
      console.error('Failed to save study plans to localStorage')
    }
  }, [plans])

  const toggleTask = (planId: string, taskId: string) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id !== planId
          ? plan
          : {
              ...plan,
              tasks: plan.tasks.map((task) =>
                task.id === taskId ? { ...task, done: !task.done } : task,
              ),
            },
      ),
    )
  }

  const value = useMemo(
    () => ({ plans, toggleTask }),
    [plans],
  )

  return <StudyPlanContext.Provider value={value}>{children}</StudyPlanContext.Provider>
}

export function useStudyPlan() {
  const context = useContext(StudyPlanContext)
  if (!context) {
    throw new Error('useStudyPlan must be used within StudyPlanProvider')
  }

  return context
}
