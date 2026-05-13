import { useEffect, useState } from 'react'
import { BadgeInfo, Sparkles } from 'lucide-react'
import PageContainer from '../../components/PageContainer/PageContainer'
import SkillSelectableCard from '../../components/SkillSelectableCard/SkillSelectableCard'
import SkillCategoryCard from '../../components/SkillCategoryCard/SkillCategoryCard'
import CompatibilityCard from '../../components/CompatibilityCard/CompatibilityCard'
import { fetchCompatibility } from './compatibilityService'
import { useCompatibility } from './useCompatibility'
import styles from './compatibility.module.css'

export default function CompatibilityPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    // read description and title from query params when present
    const params = new URLSearchParams(window.location.search)
    const description = params.get('description') ?? undefined
    const title = params.get('title') ?? undefined
    const jobId = params.get('jobId') ?? undefined

    fetchCompatibility(description ?? undefined, title ?? undefined, jobId ?? undefined).then(res => {
      if (mounted) setData(res)
    })
    return () => {
      mounted = false
    }
  }, [])

  const defaultData = {
    title: 'Carregando...',
    compatibility: 0,
    requiredSkills: [],
    optionalSkills: [],
  }

  const compat = useCompatibility(data || defaultData)

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
