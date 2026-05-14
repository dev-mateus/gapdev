export type AnalysisResult = {
  jobTitle: string
  company: string
  compatibility: number
  userLevel: string
  jobLevel: string
  hasSkills: string[]
  needSkills: string[]
  recommendation: string
}

export type AnalysisContextData = AnalysisResult & {
  jobId?: string
}
