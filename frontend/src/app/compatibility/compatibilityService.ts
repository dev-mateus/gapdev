import type { CompatibilityResponse } from './types'
import { apiPost } from '../../services/api'

type AnaliseSkill = { name: string; importance?: string }

function mapAnaliseToCompatibility(data: any, title?: string): CompatibilityResponse {
  // If the backend already returns compatibility-shaped response, use directly
  if (data && typeof data.title === 'string' && typeof data.compatibility === 'number') {
    return {
      title: data.title,
      compatibility: Math.max(0, Math.min(100, Math.round(data.compatibility))),
      requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : [],
      optionalSkills: Array.isArray(data.optionalSkills) ? data.optionalSkills : [],
    }
  }

  // If backend returns an analysis with `skills` array, map by importance
  const skills: AnaliseSkill[] = Array.isArray(data?.skills) ? data.skills : []

  const required = skills.filter(s => (s.importance ?? '').toLowerCase() === 'high').map(s => s.name)
  const optional = skills.filter(s => (s.importance ?? '').toLowerCase() !== 'high').map(s => s.name)

  return {
    title: title ?? data?.title ?? 'Vaga analisada',
    compatibility: typeof data?.compatibility === 'number' ? Math.max(0, Math.min(100, Math.round(data.compatibility))) : 0,
    requiredSkills: required,
    optionalSkills: optional,
  }
}

export async function fetchCompatibility(description?: string, title?: string, jobId?: string): Promise<CompatibilityResponse> {
  if (!description) {
    // fallback to mock when no description provided
    await new Promise((r) => setTimeout(r, 150))
    return {
      title: title ?? 'Desenvolvedor Full Stack Pleno',
      compatibility: 8,
      requiredSkills: ['Node.js', 'TypeScript', 'PostgreSQL'],
      optionalSkills: ['Docker', 'AWS', 'CI/CD'],
    }
  }

  const payload: { description: string; job_id?: string } = { description }
  if (jobId) {
    payload.job_id = jobId
  }

  const data = await apiPost('/analise', payload)
  return mapAnaliseToCompatibility(data, title)
}
