import type { AnalyzeJobRequest, AnalyzeJobResponse } from '../types/analisarVaga'

export async function submitJobForAnalysis(payload: AnalyzeJobRequest): Promise<AnalyzeJobResponse> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 500)
  })

  return {
    status: 'queued',
    message: `Análise da vaga \"${payload.title}\" enviada com sucesso.`,
  }
}
