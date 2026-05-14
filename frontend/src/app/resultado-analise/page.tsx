import { useEffect, useState } from 'react'
import { Lightbulb, BookOpen, Save, Briefcase, Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../components/PageContainer/PageContainer'
import SectionCard from '../../components/SectionCard/SectionCard'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton'
import Button from '../../components/Button/Button'
import styles from './resultado-analise.module.css'
import type { AnalysisResult } from './types'

// Mock data - será substituído por dados reais
const mockData: AnalysisResult = {
  jobTitle: 'Desenvolvedor Backend Pleno',
  company: 'Google',
  compatibility: 50,
  userLevel: 'Intermediário',
  jobLevel: 'Pleno',
  hasSkills: ['JavaScript', 'Node.js', 'Git', 'APIs REST', 'SQL'],
  needSkills: ['Docker', 'AWS', 'Testes Automatizados', 'CI/DC', 'GraphQL'],
  recommendation: 'Você está no caminho certo. Foque nas habilidades mais importantes que faltam para aumentar suas chances de seleção. Recomendamos começar por Docker e AWS.',
}

function getStoredAnalysisData(): AnalysisResult | null {
  try {
    const stored = window.sessionStorage.getItem('analysisResult')
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AnalysisResult>
      return {
        ...mockData,
        ...parsed,
      }
    }
  } catch (e) {
    console.error('Failed to parse analysis data:', e)
  }
  return null
}

export default function ResultadoAnalisePage() {
  const navigate = useNavigate()
  const [data, setData] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Tentar carregar dados do sessionStorage, senão usar mock
    const timer = setTimeout(() => {
      if (mounted) {
        const storedData = getStoredAnalysisData()
        setData(storedData || mockData)
        setIsLoading(false)
      }
    }, 500)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  const handleSaveJob = () => {
    // Implementar salvar vaga
    console.log('Salvar vaga:', data)
  }

  const handleGeneratePlan = () => {
    // Navegar para plano de estudos
    navigate('/plano-estudos')
  }

  if (isLoading || !data) {
    return (
      <div className={styles.content}>
        <PageContainer className={styles.expandedContainer}>
          <div className={styles.loadingState}>Carregando análise...</div>
        </PageContainer>
      </div>
    )
  }

  const compatibilityLevel =
    data.compatibility >= 70
      ? 'Alta Compatibilidade'
      : data.compatibility >= 50
        ? 'Média Compatibilidade'
        : 'Compatibilidade Baixa'

  const compatibilityColor =
    data.compatibility >= 70 ? 'high' : data.compatibility >= 50 ? 'medium' : 'low'

  return (
    <div className={styles.content}>
      <PageContainer className={styles.expandedContainer}>
        <div className={styles.page}>
          {/* Header */}
          <section className={styles.hero}>
            <div className={styles.heroHeading}>
              <h1 className={styles.title}>Resultado da Análise</h1>
              <p className={styles.subtitle}>
                Confira o resultado da análise da vaga com base no seu perfil técnico.
              </p>
            </div>
          </section>

          {/* Main Analysis Card */}
          <section className={styles.analysisCard}>
            {/* Job Header */}
            <div className={styles.jobHeader}>
              <div className={styles.jobInfo}>
                <div className={styles.briefcaseIcon}>
                  <Briefcase size={24} />
                </div>
                <div className={styles.jobDetails}>
                  <h2 className={styles.jobTitle}>{data.jobTitle}</h2>
                  <p className={styles.company}>{data.company}</p>
                </div>
              </div>
            </div>

            {/* Compatibility Section */}
            <div className={styles.compatibilitySection}>
              <div className={styles.circularProgress}>
                <svg viewBox="0 0 120 120" className={styles.progressCircle}>
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    className={`${styles.progressBackground}`}
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    className={`${styles.progressFill} ${styles[`fill-${compatibilityColor}`]}`}
                    style={{
                      strokeDasharray: `${(data.compatibility / 100) * 2 * Math.PI * 54} ${2 * Math.PI * 54}`,
                    }}
                  />
                </svg>
                <div className={styles.progressText}>
                  <span className={styles.percentage}>{data.compatibility}%</span>
                </div>
              </div>

              <div className={styles.compatibilityInfo}>
                <div className={styles.compatibilityBadge}>{compatibilityLevel}</div>
                <p className={styles.compatibilityDescription}>
                  Você possui uma boa base, mas ainda precisa desenvolver algumas habilidades importantes para essa posição.
                </p>

                <div className={styles.levelIndicators}>
                  <div className={styles.levelItem}>
                    <span className={styles.levelLabel}>Seu nível atual</span>
                    <span className={styles.levelValue}>{data.userLevel}</span>
                  </div>
                  <div className={styles.levelItem}>
                    <span className={styles.levelLabel}>Nível da vaga</span>
                    <span className={styles.levelValue}>{data.jobLevel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className={styles.skillsContainer}>
              {/* Has Skills */}
              <SectionCard
                title="Habilidades que você possui"
                icon={<Check size={20} />}
                className={`${styles.skillCard} ${styles.hasSkillCard}`}
              >
                <div className={styles.skillsList}>
                  {data.hasSkills.map((skill) => (
                    <div key={skill} className={styles.skillItem}>
                      <Check size={16} className={styles.checkmarkIcon} />
                      {skill}
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Need Skills */}
              <SectionCard
                title="Habilidades que você precisa desenvolver"
                icon={<X size={20} />}
                className={`${styles.skillCard} ${styles.needSkillCard}`}
              >
                <div className={styles.skillsList}>
                  {data.needSkills.map((skill) => (
                    <div key={skill} className={styles.skillItem}>
                      <X size={16} className={styles.xmarkIcon} />
                      {skill}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* Recommendation Card */}
            <SectionCard
              title="Recomendação"
              icon={<Lightbulb size={20} />}
              className={styles.recommendationCard}
            >
              <p className={styles.recommendationText}>{data.recommendation}</p>
            </SectionCard>
          </section>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <Button
              onClick={handleSaveJob}
              variant="secondary"
              size="large"
              icon={<Save size={18} />}
            >
              Salvar Vaga
            </Button>
            <PrimaryButton
              onClick={handleGeneratePlan}
              size="large"
              icon={<BookOpen size={18} />}
            >
              Gerar plano de estudo
            </PrimaryButton>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
