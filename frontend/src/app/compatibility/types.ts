export type CompatibilityResponse = {
  title: string
  compatibility: number
  requiredSkills: string[]
  optionalSkills: string[]
  level?: string
}

export type SkillSelectionState = {
  selectedRequired: Record<string, boolean>
  selectedOptional: Record<string, boolean>
}

export type UseCompatibilityReturn = {
  title: string
  baseCompatibility: number
  selections: SkillSelectionState
  recalculatedCompatibility: number
  toggleRequired: (skill: string, value?: boolean) => void
  toggleOptional: (skill: string, value?: boolean) => void
  syncing?: Record<string, boolean>
}
