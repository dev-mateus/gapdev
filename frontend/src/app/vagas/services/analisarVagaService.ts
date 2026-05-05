import { apiPost } from '../../../services/api'
import type { AnalyzeJobRequest, AnalyzeJobResponse } from '../types/analisarVaga'

export async function submitJobForAnalysis(payload: AnalyzeJobRequest): Promise<AnalyzeJobResponse> {
  await apiPost('/jobs', {
    company_name: payload.company,
    job_title: payload.title,
    description: payload.description,
  })

  return {
    status: 'saved',
    message: `Vaga "${payload.title}" salva com sucesso.`,
  }
}
