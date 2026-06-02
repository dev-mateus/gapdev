import { useEffect, useState } from 'react'
import { BadgeInfo, Sparkles, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../components/PageContainer/PageContainer'
import SkillSelectableCard from '../../components/SkillSelectableCard/SkillSelectableCard'
import SkillCategoryCard from '../../components/SkillCategoryCard/SkillCategoryCard'
import CompatibilityCard from '../../components/CompatibilityCard/CompatibilityCard'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton'
import { fetchCompatibility } from './compatibilityService'
import type { CompatibilityResponse } from './types'
import { useCompatibility } from './useCompatibility'
import styles from './compatibility.module.css'

const defaultData = {
  title: 'Carregando...',
  compatibility: 0,
  requiredSkills: [],
  optionalSkills: [],
}

export default function CompatibilityPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<CompatibilityResponse | null>(null)
  const [jobId, setJobId] = useState<string | undefined>()

  useEffect(() => {
    let mounted = true
    const params = new URLSearchParams(window.location.search)
    const currentJobId = params.get('jobId') ?? undefined
    setJobId(currentJobId)

    const analysisContext = getAnalysisContext(currentJobId)
    const description = analysisContext?.description ?? params.get('description') ?? undefined
    const title = analysisContext?.title ?? params.get('title') ?? undefined

    fetchCompatibility(description ?? undefined, title ?? undefined, currentJobId ?? undefined).then(res => {
      if (mounted) setData(res)
    })
    return () => {
      mounted = false
    }
  }, [])

  const compat = useCompatibility(data || defaultData)

  const handleConcluir = () => {
    const analysisContext = getAnalysisContext(jobId)

    const hasSkills = uniqueSkills([
      ...getSelectedSkills(compat.selections.selectedRequired),
      ...getSelectedSkills(compat.selections.selectedOptional),
    ])

    const needSkills = uniqueSkills([
      ...getSelectedSkills(compat.selections.selectedRequired, false),
      ...getSelectedSkills(compat.selections.selectedOptional, false),
    ]).filter((skill) => !hasSkills.some((selectedSkill) => normalizeSkillKey(selectedSkill) === normalizeSkillKey(skill)))

    const analysisData = {
      jobId,
      jobTitle: compat.title,
      company: analysisContext?.company ?? '',
      compatibility: compat.recalculatedCompatibility,
      userLevel: getUserLevelLabel(compat.recalculatedCompatibility),
      jobLevel: getJobLevelLabel(compat.title),
      hasSkills,
      needSkills,
      recommendation: buildRecommendation(compat.selections.selectedRequired, compat.selections.selectedOptional),
    }

    const usuarioLogado = JSON.parse(
      localStorage.getItem('usuarioLogado') || '{}'
    )

    window.sessionStorage.setItem(
      `analysisResult_${usuarioLogado.email}`,
      JSON.stringify(analysisData)
    )

    navigate('/analise', { replace: true })
  }

  if (!data) {
    return (
      <div className={styles.content}>
        <PageContainer className={styles.expandedContainer}>
          <div className={styles.loadingState}>Carregando análise da vaga...</div>
        </PageContainer>
      </div>
    )
  }

  return (
    <div className={styles.content}>
      <PageContainer className={styles.expandedContainer}>
        <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroHeading}>
            <h1 className={styles.title}>Marque o que você já conhece</h1>
            <p className={styles.subtitle}>
              Selecione as habilidades que você já domina — as demais entrarão no seu plano de estudos.
            </p>
          </div>

          <CompatibilityCard title={compat.title} compatibility={compat.recalculatedCompatibility} />

          <div className={styles.infoBanner}>
            <span className={styles.infoIcon} aria-hidden>
              <BadgeInfo size={18} />
            </span>
            <p>
              Habilidades já conhecidas do seu perfil podem vir pré-marcadas. As seleções são salvas automaticamente para as próximas análises.
            </p>
          </div>
        </section>

        <section className={styles.skillsSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionIcon} aria-hidden>
              <Sparkles size={18} />
            </span>
            <h2 className={styles.sectionTitle}>Habilidades para vaga</h2>
          </div>

          <div className={styles.grid}>
            <SkillCategoryCard
              title="Habilidades obrigatórias"
              description="Principais habilidades necessárias"
              type="required"
            >
              {data.requiredSkills.map((skill: string) => (
                <SkillSelectableCard
                  key={skill}
                  name={skill}
                  description={inferSkillGroup(skill)}
                  selected={compat.selections.selectedRequired[skill]}
                  onToggle={(value) => compat.toggleRequired(skill, value)}
                  syncing={Boolean(compat.syncing?.[skill])}
                />
              ))}
            </SkillCategoryCard>

            <SkillCategoryCard
              title="Habilidades desejáveis"
              description="Diferenciais para a vaga"
              type="optional"
            >
              {data.optionalSkills.map((skill: string) => (
                <SkillSelectableCard
                  key={skill}
                  name={skill}
                  description={inferSkillGroup(skill)}
                  selected={compat.selections.selectedOptional[skill]}
                  onToggle={(value) => compat.toggleOptional(skill, value)}
                  syncing={Boolean(compat.syncing?.[skill])}
                />
              ))}
            </SkillCategoryCard>
          </div>
        </section>
        </div>
        
        <div className={styles.actionContainer}>
          <PrimaryButton onClick={handleConcluir} size="large" icon={<Check size={18} />}>
            Concluir análise
          </PrimaryButton>
        </div>
      </PageContainer>
    </div>
  )
}

function inferSkillGroup(skill: string) {
  const normalized = skill.toLowerCase()

  if (normalized.includes('docker') || normalized.includes('aws') || normalized.includes('ci') || normalized.includes('devops')) {
    return 'DevOps'
  }

  if (normalized.includes('postgres') || normalized.includes('sql') || normalized.includes('node') || normalized.includes('typescript') || normalized.includes('backend')) {
    return 'Backend'
  }

  if (normalized.includes('react') || normalized.includes('frontend') || normalized.includes('ui')) {
    return 'Frontend'
  }

  return 'Competência'
}

function getAnalysisContext(jobId?: string): { title?: string; company?: string; description?: string } | null {
  if (!jobId) {
    return null
  }

  const rawValue = window.sessionStorage.getItem(`analysis:${jobId}`)

  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as { title?: string; company?: string; description?: string }
    return parsed
  } catch {
    return null
  }
}

function getSelectedSkills(selectionMap: Record<string, boolean>, selected = true): string[] {
  return Object.keys(selectionMap).filter((skill) => selectionMap[skill] === selected)
}

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

function getUserLevelLabel(compatibility: number): string {
  if (compatibility >= 80) return 'Avançado'
  if (compatibility >= 55) return 'Intermediário'
  return 'Júnior'
}

function getJobLevelLabel(title?: string): string {
  const normalized = (title ?? '').toLowerCase()

  if (normalized.includes('senior') || normalized.includes('sênior')) return 'Sênior'
  if (normalized.includes('pleno')) return 'Pleno'
  if (normalized.includes('junior') || normalized.includes('júnior')) return 'Júnior'

  return 'Não informado'
}

function buildRecommendation(
  selectedRequired: Record<string, boolean>,
  selectedOptional: Record<string, boolean>
): string {
  const missingRequired = Object.keys(selectedRequired).filter((skill) => !selectedRequired[skill])
  const highlighted = missingRequired.slice(0, 2)

  if (highlighted.length > 0) {
    return `Você está no caminho certo. Foque primeiro em ${highlighted.join(' e ')} para aumentar suas chances de seleção.`
  }

  const optionalCount = Object.values(selectedOptional).filter(Boolean).length
  if (optionalCount > 0) {
    return 'Você já cobre os principais requisitos. Agora vale reforçar os diferenciais da vaga para subir sua compatibilidade.'
  }

  return 'Você marcou as habilidades conhecidas. Revise os requisitos obrigatórios para avançar sua compatibilidade.'
}
