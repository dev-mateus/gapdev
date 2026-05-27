import type { CompatibilityResponse } from './types'
import { apiPost } from '../../services/api'

type AnaliseSkill = { name?: string; raw_name?: string; importance?: string; priority?: string }

function mapAnaliseToCompatibility(data: unknown, title?: string): CompatibilityResponse {
  const d = (data ?? {}) as Record<string, unknown>

  // If the backend already returns compatibility-shaped response, use directly
  if (typeof d.title === 'string' && typeof d.compatibility === 'number') {
    const required = Array.isArray(d.requiredSkills) ? (d.requiredSkills as string[]) : []
    const optional = Array.isArray(d.optionalSkills) ? (d.optionalSkills as string[]) : []

    return {
      title: d.title,
      compatibility: Math.max(0, Math.min(100, Math.round(d.compatibility))),
      requiredSkills: required,
      optionalSkills: optional,
    }
  }

  // If backend returns an analysis with `job_skills` array, map by priority.
  const rawSkills = Array.isArray(d.job_skills)
    ? (d.job_skills as unknown[])
    : Array.isArray(d.skills)
      ? (d.skills as unknown[])
      : []

  const skills: AnaliseSkill[] = rawSkills.map((it) => {
    const r = (it ?? {}) as Record<string, unknown>
    return {
      name: typeof r.name === 'string' ? r.name : undefined,
      raw_name: typeof r.raw_name === 'string' ? r.raw_name : undefined,
      importance: typeof r.importance === 'string' ? r.importance : undefined,
      priority: typeof r.priority === 'string' ? r.priority : undefined,
    }
  })

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
    title: title ?? (typeof d.title === 'string' ? d.title : 'Vaga analisada'),
    compatibility: typeof d.compatibility === 'number' ? Math.max(0, Math.min(100, Math.round(d.compatibility))) : 0,
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

  const data = await apiPost<unknown>('/analise', payload)
  return mapAnaliseToCompatibility(data, title)
}
