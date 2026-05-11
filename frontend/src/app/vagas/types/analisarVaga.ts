export type AnalyzeJobRequest = {
  title: string
  company: string
  description: string
}

export type AnalyzeJobResponse = {
  status: 'saved'
  message: string
}

export type AnalyzeSkill = {
  name: string
  required_level?: string | null
  importance?: string | null
  evidence?: string | null
  recommendation?: string | null
}

export type AnalyzeJobAiResponse = {
  summary: string
  skills: AnalyzeSkill[]
}

export type AnalyzeJobFormState = {
  title: string
  company: string
  description: string
}
