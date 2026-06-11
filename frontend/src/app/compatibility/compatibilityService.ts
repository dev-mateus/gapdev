import type { CompatibilityResponse } from './types'
import { apiPost } from '../../services/api'

type AnaliseSkill = { name?: string; raw_name?: string; importance?: string; priority?: string }

function normalizeSkillKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function uniqueSkills(skills: string[]): string[] {
  const seen = new Set<string>()

  return skills.filter((skill) => {
    const key = normalizeSkillKey(skill)
    if (!key || seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function mapAnaliseToCompatibility(data: unknown, title?: string): CompatibilityResponse {
  const d = (data ?? {}) as Record<string, unknown>
  const level = typeof d.level === 'string' ? d.level : undefined

  // If the backend already returns compatibility-shaped response, use directly
  if (typeof d.title === 'string' && typeof d.compatibility === 'number') {
    const required = Array.isArray(d.requiredSkills) ? (d.requiredSkills as string[]) : []
    const optional = Array.isArray(d.optionalSkills) ? (d.optionalSkills as string[]) : []

    return {
      title: d.title,
      compatibility: Math.max(0, Math.min(100, Math.round(d.compatibility))),
      requiredSkills: required,
      optionalSkills: optional,
      level,
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

  const uniqueRequired = uniqueSkills(required)
  const uniqueOptional = uniqueSkills(optional).filter(
    (skill) => !uniqueRequired.some((requiredSkill) => normalizeSkillKey(requiredSkill) === normalizeSkillKey(skill))
  )

  return {
    title: title ?? (typeof d.title === 'string' ? d.title : 'Vaga analisada'),
    compatibility: typeof d.compatibility === 'number' ? Math.max(0, Math.min(100, Math.round(d.compatibility))) : 0,
    requiredSkills: uniqueRequired,
    optionalSkills: uniqueOptional,
    level,
  }
}

export async function fetchCompatibility(description?: string, title?: string, jobId?: string): Promise<CompatibilityResponse | null> {
  if (!description) {
    return null 
  }

  const payload: { description: string; job_id?: string } = { description }
  if (jobId) {
    payload.job_id = jobId
  }

  const data = await apiPost<unknown>('/analise', payload)
  return mapAnaliseToCompatibility(data, title)
}