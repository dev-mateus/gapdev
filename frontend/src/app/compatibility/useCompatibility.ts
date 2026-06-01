import { useEffect, useMemo, useState } from 'react'
import type { CompatibilityResponse, SkillSelectionState, UseCompatibilityReturn } from './types'
import { apiGet, apiPost, apiDelete } from '../../services/api'


const storageKey = (title: string) => `gnose:compat:${title}`

function normalizeSkillKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function useCompatibility(initial: CompatibilityResponse): UseCompatibilityReturn {
  const { title, compatibility: initialCompatibility, requiredSkills, optionalSkills } = initial

  const baseCompatibility = useMemo(() => Math.max(0, Math.min(100, initialCompatibility)), [initialCompatibility])

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

  const [catalogByName, setCatalogByName] = useState<Record<string, string>>({})
  const [catalogNameById, setCatalogNameById] = useState<Record<string, string>>({})
  const [userSkillByCatalogId, setUserSkillByCatalogId] = useState<Record<string, string>>({})
  const [ownedSkillKeys, setOwnedSkillKeys] = useState<Record<string, boolean>>({})
  const [syncingMap, setSyncingMap] = useState<Record<string, boolean>>({})
  const [preselectionApplied, setPreselectionApplied] = useState(false)

  useEffect(() => {
    let storedSelections: SkillSelectionState | null = null

    try {
      const raw = localStorage.getItem(storageKey(title))
      if (raw) {
        storedSelections = JSON.parse(raw) as SkillSelectionState
      }
    } catch (_) {
      // ignore
    }

    setSelections((current) => {
      const sourceRequired = storedSelections?.selectedRequired ?? current.selectedRequired
      const sourceOptional = storedSelections?.selectedOptional ?? current.selectedOptional

      return {
        selectedRequired: Object.fromEntries(requiredSkills.map(s => [s, sourceRequired[s] ?? false])),
        selectedOptional: Object.fromEntries(optionalSkills.map(s => [s, sourceOptional[s] ?? false])),
      }
    })
  }, [title, requiredSkills, optionalSkills])

  useEffect(() => {
    setPreselectionApplied(false)
  }, [title])

  // Load catalog and user's saved skills to enable syncing by skill_id
  useEffect(() => {
    let mounted = true

    async function loadCatalogAndUserSkills() {
      try {
        const [catalog, userSkills] = await Promise.all([
          apiGet<Array<{ id: string; canonical_name?: string; name?: string }>>('/skills/catalog'),
          apiGet<Array<{ id: string; skill_id?: string; skill_name?: string }>>('/skills'),
        ])

        if (!mounted) return

        const byName: Record<string, string> = {}
        const nameById: Record<string, string> = {}
        for (const item of catalog || []) {
          const name = (item.canonical_name || item.name || '').toString().trim()
          const normalizedName = normalizeSkillKey(name)
          if (normalizedName) {
            byName[normalizedName] = String(item.id)
          }

          if (name) {
            nameById[String(item.id)] = name
          }
        }

        const userMap: Record<string, string> = {}
        const owned: Record<string, boolean> = {}
        for (const us of userSkills || []) {
          if (us.skill_id) userMap[String(us.skill_id)] = String(us.id)

          const skillNameFromPayload = (us.skill_name || '').toString().trim()
          if (skillNameFromPayload) {
            owned[normalizeSkillKey(skillNameFromPayload)] = true
          }

          if (us.skill_id && nameById[String(us.skill_id)]) {
            owned[normalizeSkillKey(nameById[String(us.skill_id)])] = true
          }
        }

        setCatalogByName(byName)
        setCatalogNameById(nameById)
        setUserSkillByCatalogId(userMap)
        setOwnedSkillKeys(owned)
      } catch (_) {
        // ignore errors; syncing will fallback to names
      }
    }

    loadCatalogAndUserSkills()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(title), JSON.stringify(selections))
    } catch (_) {}
  }, [selections, title])

  useEffect(() => {
    if (preselectionApplied || Object.keys(ownedSkillKeys).length === 0) {
      return
    }

    setSelections((current) => ({
      selectedRequired: Object.fromEntries(
        requiredSkills.map((skill) => {
          const currentValue = current.selectedRequired[skill] ?? false
          const shouldPreselect = Boolean(ownedSkillKeys[normalizeSkillKey(skill)])
          return [skill, currentValue || shouldPreselect]
        }),
      ),
      selectedOptional: Object.fromEntries(
        optionalSkills.map((skill) => {
          const currentValue = current.selectedOptional[skill] ?? false
          const shouldPreselect = Boolean(ownedSkillKeys[normalizeSkillKey(skill)])
          return [skill, currentValue || shouldPreselect]
        }),
      ),
    }))

    setPreselectionApplied(true)
  }, [ownedSkillKeys, optionalSkills, preselectionApplied, requiredSkills])

  const toggleRequired = (skill: string, value?: boolean) => {
    const newValue = value ?? !selections.selectedRequired[skill]
    setSelections(prev => ({
      ...prev,
      selectedRequired: { ...prev.selectedRequired, [skill]: newValue },
    }))

    // Sync with backend (with simple retry and syncing indicator)
    ;(async () => {
      const skillKey = skill
      setSyncingMap(prev => ({ ...prev, [skillKey]: true }))
      try {
        const normalizedSkill = normalizeSkillKey(skill)
        const catalogId = catalogByName[normalizedSkill]

        if (newValue) {
          const body = catalogId ? { skill_id: catalogId, level: 'Basic' } : { skill_name: skill, level: 'Basic' }
          let attempts = 0
          let created: { id?: string; skill_id?: string } | null = null
          while (attempts < 2) {
            try {
              created = await apiPost<{ id?: string; skill_id?: string }>('/skills', body)
              break
            } catch (err) {
              attempts += 1
              if (attempts >= 2) throw err
              await new Promise(r => setTimeout(r, 300))
            }
          }

          if (created?.skill_id) {
            setUserSkillByCatalogId(prev => ({ ...prev, [String(created!.skill_id)]: String(created!.id) }))
            if (catalogNameById[String(created.skill_id)]) {
              setOwnedSkillKeys((prev) => ({
                ...prev,
                [normalizeSkillKey(catalogNameById[String(created.skill_id)])]: true,
              }))
            }
          }
        } else {
          if (catalogId) {
            const userSkillId = userSkillByCatalogId[catalogId]
            if (userSkillId) {
              let attempts = 0
              while (attempts < 2) {
                try {
                  await apiDelete(`/skills/${userSkillId}`)
                  break
                } catch (err) {
                  attempts += 1
                  if (attempts >= 2) throw err
                  await new Promise(r => setTimeout(r, 200))
                }
              }

              setUserSkillByCatalogId(prev => {
                const next = { ...prev }
                delete next[catalogId]
                return next
              })
            }
          }
        }
      } catch (_) {
        // ignore backend errors for now
      } finally {
        setSyncingMap(prev => ({ ...prev, [skillKey]: false }))
      }
    })()
  }

  const toggleOptional = (skill: string, value?: boolean) => {
    const newValue = value ?? !selections.selectedOptional[skill]
    setSelections(prev => ({
      ...prev,
      selectedOptional: { ...prev.selectedOptional, [skill]: newValue },
    }))

    ;(async () => {
      const skillKey = skill
      setSyncingMap(prev => ({ ...prev, [skillKey]: true }))
      try {
        const normalizedSkill = normalizeSkillKey(skill)
        const catalogId = catalogByName[normalizedSkill]

        if (newValue) {
          const body = catalogId ? { skill_id: catalogId, level: 'Basic' } : { skill_name: skill, level: 'Basic' }
          let attempts = 0
          let created: { id?: string; skill_id?: string } | null = null
          while (attempts < 2) {
            try {
              created = await apiPost<{ id?: string; skill_id?: string }>('/skills', body)
              break
            } catch (err) {
              attempts += 1
              if (attempts >= 2) throw err
              await new Promise(r => setTimeout(r, 300))
            }
          }

          if (created?.skill_id) {
            setUserSkillByCatalogId(prev => ({ ...prev, [String(created!.skill_id)]: String(created!.id) }))
            if (catalogNameById[String(created.skill_id)]) {
              setOwnedSkillKeys((prev) => ({
                ...prev,
                [normalizeSkillKey(catalogNameById[String(created.skill_id)])]: true,
              }))
            }
          }
        } else {
          if (catalogId) {
            const userSkillId = userSkillByCatalogId[catalogId]
            if (userSkillId) {
              let attempts = 0
              while (attempts < 2) {
                try {
                  await apiDelete(`/skills/${userSkillId}`)
                  break
                } catch (err) {
                  attempts += 1
                  if (attempts >= 2) throw err
                  await new Promise(r => setTimeout(r, 200))
                }
              }

              setUserSkillByCatalogId(prev => {
                const next = { ...prev }
                delete next[catalogId]
                return next
              })
            }
          }
        }
      } catch (_) {
        // ignore
      } finally {
        setSyncingMap(prev => ({ ...prev, [skillKey]: false }))
      }
    })()
  }

  const recalculatedCompatibility = useMemo(() => {
    const delta = Math.max(0, 100 - baseCompatibility)

    const requiredKeys = Object.keys(selections.selectedRequired)
    const optionalKeys = Object.keys(selections.selectedOptional)
    const nRequired = requiredKeys.length
    const nOptional = optionalKeys.length

    // Multipliers
    const REQUIRED_MULT = 2
    const OPTIONAL_MULT = 1

    const totalMultiplier = nRequired * REQUIRED_MULT + nOptional * OPTIONAL_MULT
    if (totalMultiplier === 0) return baseCompatibility

    // Compute added amount by distributing the delta proportionally
    let added = 0
    for (const key of requiredKeys) {
      if (selections.selectedRequired[key]) {
        added += (delta * REQUIRED_MULT) / totalMultiplier
      }
    }
    for (const key of optionalKeys) {
      if (selections.selectedOptional[key]) {
        added += (delta * OPTIONAL_MULT) / totalMultiplier
      }
    }

    const total = Math.min(100, Math.round(baseCompatibility + added))
    return total
  }, [selections, baseCompatibility])

  return {
    title,
    baseCompatibility,
    selections,
    syncing: syncingMap,
    recalculatedCompatibility,
    toggleRequired,
    toggleOptional,
  }
}
