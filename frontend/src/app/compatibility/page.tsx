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

  useEffect(() => {
    let mounted = true
    const params = new URLSearchParams(window.location.search)
    const jobId = params.get('jobId') ?? undefined
    const analysisContext = getAnalysisContext(jobId)
    const description = analysisContext?.description ?? params.get('description') ?? undefined
    const title = analysisContext?.title ?? params.get('title') ?? undefined

    fetchCompatibility(description ?? undefined, title ?? undefined, jobId ?? undefined).then(res => {
      if (mounted) setData(res)
    })
    return () => {
      mounted = false
    }
  }, [])

  const compat = useCompatibility(data || defaultData)

  const handleConcluir = () => {
    // Armazenar dados de análise em sessionStorage para passar para resultado-analise
    
    const analysisData = {
      jobTitle: compat.title,
      compatibility: compat.recalculatedCompatibility,
      hasSkills: Object.keys(compat.selections.selectedRequired).filter(
        (skill) => compat.selections.selectedRequired[skill]
      ),
      needSkills: Object.keys(compat.selections.selectedRequired).filter(
        (skill) => !compat.selections.selectedRequired[skill]
      ),
    }
    
    // Salvar em sessionStorage
    window.sessionStorage.setItem('analysisResult', JSON.stringify(analysisData))
    
    // Navegar para resultado-analise
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

function getAnalysisContext(jobId?: string): { title?: string; description?: string } | null {
  if (!jobId) {
    return null
  }

  const rawValue = window.sessionStorage.getItem(`analysis:${jobId}`)

  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as { title?: string; description?: string }
    return parsed
  } catch {
    return null
  }
}
