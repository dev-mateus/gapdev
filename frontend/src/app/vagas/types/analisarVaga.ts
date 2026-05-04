export type AnalyzeJobRequest = {
  title: string
  company: string
  description: string
}

export type AnalyzeJobResponse = {
  status: 'queued'
  message: string
}

export type AnalyzeJobFormState = {
  title: string
  company: string
  description: string
}
