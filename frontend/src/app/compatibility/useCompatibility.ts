import { useEffect, useMemo, useState } from 'react'
import type { CompatibilityResponse, SkillSelectionState } from './types'

const REQUIRED_WEIGHT = 15
const OPTIONAL_WEIGHT = 5

const storageKey = (title: string) => `gnose:compat:${title}`

export function useCompatibility(initial: CompatibilityResponse) {
  const { title, compatibility: initialCompatibility, requiredSkills, optionalSkills } = initial

  const [baseCompatibility] = useState(() => Math.max(0, Math.min(100, initialCompatibility)))

  const [selections, setSelections] = useState<SkillSelectionState>(() => {
    try {
      const raw = localStorage.getItem(storageKey(title))
      if (raw) return JSON.parse(raw) as SkillSelectionState
    } catch (_) {
      // ignore
    }

    return {
      selectedRequired: Object.fromEntries(requiredSkills.map(s => [s, false])),
      selectedOptional: Object.fromEntries(optionalSkills.map(s => [s, false])),
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(title), JSON.stringify(selections))
    } catch (_) {}
  }, [selections, title])

  const toggleRequired = (skill: string, value?: boolean) => {
    setSelections(prev => ({
      ...prev,
      selectedRequired: { ...prev.selectedRequired, [skill]: value ?? !prev.selectedRequired[skill] },
    }))
  }

  const toggleOptional = (skill: string, value?: boolean) => {
    setSelections(prev => ({
      ...prev,
      selectedOptional: { ...prev.selectedOptional, [skill]: value ?? !prev.selectedOptional[skill] },
    }))
  }

  const recalculatedCompatibility = useMemo(() => {
    let added = 0
    Object.entries(selections.selectedRequired).forEach(([, v]) => {
      if (v) added += REQUIRED_WEIGHT
    })
    Object.entries(selections.selectedOptional).forEach(([, v]) => {
      if (v) added += OPTIONAL_WEIGHT
    })

    const total = Math.min(100, baseCompatibility + added)
    return total
  }, [selections, baseCompatibility])

  return {
    title,
    baseCompatibility,
    selections,
    recalculatedCompatibility,
    toggleRequired,
    toggleOptional,
  }
}
