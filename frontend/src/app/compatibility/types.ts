export type CompatibilityResponse = {
  title: string
  compatibility: number
  requiredSkills: string[]
  optionalSkills: string[]
}

export type SkillSelectionState = {
  selectedRequired: Record<string, boolean>
  selectedOptional: Record<string, boolean>
}
