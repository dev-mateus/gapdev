import type { CompatibilityResponse } from './types'
import { apiPost } from '../../services/api'

type AnaliseSkill = { name?: string; raw_name?: string; importance?: string; priority?: string }

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

  // If backend returns an analysis with `job_skills` array, map by priority.
  const skills: AnaliseSkill[] = Array.isArray(data?.job_skills)
    ? data.job_skills
    : Array.isArray(data?.skills)
      ? data.skills
      : []

  const required = skills
    .filter(s => {
      const imp = (s.priority ?? s.importance ?? '').toLowerCase()
      return imp === 'high' || imp === 'required'
    })
    .map(s => s.raw_name ?? s.name ?? '')
    .filter(Boolean)

  const optional = skills
    .filter(s => {
      const imp = (s.priority ?? s.importance ?? '').toLowerCase()
      return imp === 'desirable' || imp === 'low' || imp === 'medium' || imp === ''
    })
    .map(s => s.raw_name ?? s.name ?? '')
    .filter(Boolean)

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
