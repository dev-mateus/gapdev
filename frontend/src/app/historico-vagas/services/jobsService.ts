import { apiGet, apiDelete } from '../../../services/api'

export type JobItem = {
  id: string
  user_id: string
  company_name: string
  job_title: string
  description: string
  created_at: string
  level?: string
  compatibility?: number
  compatibilidade?: number
  tecnologias?: string[]
}

export async function fetchJobs(): Promise<JobItem[]> {
  return apiGet<JobItem[]>('/jobs')
}

export async function deleteJob(id: string): Promise<void> {
  return apiDelete(`/jobs/${id}`)
}