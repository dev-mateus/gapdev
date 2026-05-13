import { apiPost } from '../../../services/api'
import type { AnalyzeJobAiResponse, AnalyzeJobRequest, AnalyzeJobResponse } from '../types/analisarVaga'

export async function submitJobForAnalysis(payload: AnalyzeJobRequest): Promise<AnalyzeJobResponse & { jobId: string }> {
  const response = await apiPost<{ id: string; company_name: string; job_title: string }>(
    '/jobs',
    {
      company_name: payload.company,
      job_title: payload.title,
      description: payload.description,
    }
  )

  return {
    status: 'saved',
    message: `Vaga "${payload.title}" salva com sucesso.`,
    jobId: response.id,
  }
}

export async function analyzeJobDescription(description: string, jobId?: string): Promise<AnalyzeJobAiResponse> {
  const payload: { description: string; job_id?: string } = { description }
  if (jobId) {
    payload.job_id = jobId
  }
  return apiPost('/analise', payload)
}
