import { useEffect, useMemo, useState } from 'react'
import type { CompatibilityResponse, SkillSelectionState, UseCompatibilityReturn } from './types'
import { apiGet, apiPost, apiDelete } from '../../services/api'

const REQUIRED_WEIGHT = 15
const OPTIONAL_WEIGHT = 5

const storageKey = (title: string) => `gnose:compat:${title}`

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
  const [userSkillByCatalogId, setUserSkillByCatalogId] = useState<Record<string, string>>({})
  const [syncingMap, setSyncingMap] = useState<Record<string, boolean>>({})

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

  // Load catalog and user's saved skills to enable syncing by skill_id
  useEffect(() => {
    let mounted = true

    async function loadCatalogAndUserSkills() {
      try {
        const [catalog, userSkills] = await Promise.all([
          apiGet<Array<{ id: string; canonical_name?: string; name?: string }>>('/skills/catalog'),
          apiGet<Array<{ id: string; skill_id?: string }>>('/skills'),
        ])

        if (!mounted) return

        const byName: Record<string, string> = {}
        for (const item of catalog || []) {
          const name = (item.canonical_name || item.name || '').toString().trim().toLowerCase()
          if (name) byName[name] = String(item.id)
        }

        const userMap: Record<string, string> = {}
        for (const us of userSkills || []) {
          if (us.skill_id) userMap[String(us.skill_id)] = String(us.id)
        }

        setCatalogByName(byName)
        setUserSkillByCatalogId(userMap)
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
        const nameKey = skill.trim().toLowerCase()
        const catalogId = catalogByName[nameKey]

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
        const nameKey = skill.trim().toLowerCase()
        const catalogId = catalogByName[nameKey]

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
    syncing: syncingMap,
    recalculatedCompatibility,
    toggleRequired,
    toggleOptional,
  }
}
