export type AnalyzeJobRequest = {
  title: string
  company: string
  seniority: string
  description: string
}

export type AnalyzeJobResponse = {
  status: 'saved'
  message: string
}

export type AnalyzeJobFormState = {
  title: string
  company: string
  seniority: string
  description: string
}