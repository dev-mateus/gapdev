import { useEffect, useState } from 'react'
import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CircleCheck,
  CircleX,
  Lightbulb,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../components/PageContainer/PageContainer'
import PageHeader from '../../components/PageHeader/PageHeader'
import SectionCard from '../../components/SectionCard/SectionCard'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton'
import Button from '../../components/Button/Button'
import { apiPatch, apiPost } from '../../services/api'
import styles from './resultado-analise.module.css'
import type { AnalysisResult } from './types'

function getStoredAnalysisData(): AnalysisResult | null {
  try {
    const usuarioLogado = JSON.parse(
      localStorage.getItem('usuarioLogado') || '{}'
    )

    const stored = window.sessionStorage.getItem(
      `analysisResult_${usuarioLogado.email}`
    )

    if (stored) {
      return JSON.parse(stored) as AnalysisResult
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
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(() => {
      if (mounted) {
        const storedData = getStoredAnalysisData()
        setData(storedData)
        setIsLoading(false)
      }
    }, 500)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  const handleSaveJob = async () => {
    if (!data?.jobId) {
      setSaveError('Não foi possível localizar a vaga para salvar.')
      return
    }

    setIsSaving(true)
    setSaveError('')

    try {
      await apiPatch(`/jobs/${data.jobId}/compatibility`, {
        compatibility: Math.max(0, Math.min(100, Math.round(data.compatibility))),
      })
      navigate('/historico-vagas', { replace: true })
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar a vaga.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGeneratePlan = async () => {
    if (!data?.jobId) {
      setSaveError('Não foi possível localizar a vaga para gerar o plano.')
      return
    }

    setIsGeneratingPlan(true)
    setSaveError('')

    try {
      await apiPost('/study-plans/generate', {
        job_id: data.jobId,
      })
      navigate(`/plano-estudos?jobId=${data.jobId}`)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível gerar o plano de estudos.')
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.content}>
        <PageContainer className={styles.expandedContainer}>
          <div className={styles.loadingState}>Carregando análise...</div>
        </PageContainer>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={styles.content}>
        <PageContainer className={styles.expandedContainer}>
          <div className={styles.loadingState}>Nenhuma análise encontrada. Volte e conclua a análise da vaga.</div>
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

  const compatibilityDescription =
    data.compatibility >= 70
      ? 'Você possui forte aderência para essa posição e pode destacar suas habilidades mais relevantes.'
      : data.compatibility >= 50
        ? 'Você possui uma boa base, mas ainda precisa desenvolver algumas habilidades importantes para essa posição.'
        : 'Esta vaga pede habilidades que ainda precisam de atenção antes da candidatura.'

  const progressRadius = 54
  const progressLength = 2 * Math.PI * progressRadius
  const progressValue = Math.max(0, Math.min(100, Math.round(data.compatibility)))

  return (
    <div className={styles.content}>
      <PageContainer className={styles.expandedContainer}>
        <div className={styles.pageStack}>
          <PageHeader
            title="Resultado da Análise"
            description="Confira o resultado da análise da vaga com base no seu perfil técnico."
          />

          <section className={styles.analysisCard}>
            <div className={styles.jobHeader}>
              <div className={styles.jobInfo}>
                <div className={styles.briefcaseIcon}>
                  <BriefcaseBusiness size={26} />
                </div>
                <div className={styles.jobDetails}>
                  <h2 className={styles.jobTitle}>{data.jobTitle}</h2>
                  <p className={styles.company}>
                    <Building2 size={16} />
                    <span>{data.company}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.compatibilitySection}>
              <div className={styles.compatibilitySummary}>
                <div className={styles.circularProgress} aria-label={`Compatibilidade de ${progressValue}%`}>
                  <svg viewBox="0 0 120 120" className={styles.progressCircle} aria-hidden="true">
                    <circle
                      cx="60"
                      cy="60"
                      r={progressRadius}
                      className={styles.progressBackground}
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={progressRadius}
                      className={`${styles.progressFill} ${styles[`fill-${compatibilityColor}`]}`}
                      style={{
                        strokeDasharray: `${(progressValue / 100) * progressLength} ${progressLength}`,
                      }}
                    />
                  </svg>
                  <div className={styles.progressText}>
                    <span className={styles.percentage}>{progressValue}%</span>
                  </div>
                </div>

                <div className={styles.compatibilityInfo}>
                  <span className={styles.compatibilityTitle}>Compatibilidade com a vaga</span>
                  <span className={`${styles.compatibilityBadge} ${styles[`badge-${compatibilityColor}`]}`}>
                    {compatibilityLevel}
                  </span>
                  <p className={styles.compatibilityDescription}>{compatibilityDescription}</p>
                </div>
              </div>

              <div className={styles.levelIndicators}>
                <div className={styles.levelItem}>
                  <Target size={32} className={styles.levelIcon} />
                  <span className={styles.levelLabel}>Seu nível atual</span>
                  <span className={styles.levelValue}>{data.userLevel}</span>
                </div>
                <div className={styles.levelItem}>
                  <TrendingUp size={32} className={styles.levelIcon} />
                  <span className={styles.levelLabel}>Nível da vaga</span>
                  <span className={styles.levelValue}>{data.jobLevel}</span>
                </div>
              </div>
            </div>

            <div className={styles.skillsContainer}>
              <SectionCard
                title="Habilidades que você possui"
                icon={<CircleCheck size={22} />}
                className={`${styles.skillCard} ${styles.hasSkillCard}`}
              >
                <div className={styles.skillsList}>
                  {data.hasSkills.map((skill) => (
                    <div key={skill} className={styles.skillItem}>
                      <CircleCheck size={18} className={styles.checkmarkIcon} />
                      {skill}
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Habilidades que você precisa desenvolver"
                icon={<AlertCircle size={22} />}
                className={`${styles.skillCard} ${styles.needSkillCard}`}
              >
                <div className={styles.skillsList}>
                  {data.needSkills.map((skill) => (
                    <div key={skill} className={styles.skillItem}>
                      <CircleX size={18} className={styles.xmarkIcon} />
                      {skill}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

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
              disabled={isSaving || isGeneratingPlan}
            >
              {isSaving ? 'Salvando...' : 'Salvar Vaga'}
            </Button>
            <PrimaryButton
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan || isSaving}
            >
              {isGeneratingPlan ? 'Gerando plano...' : 'Gerar plano de estudo'}
            </PrimaryButton>
          </div>
          {saveError ? <p className={styles.saveError}>{saveError}</p> : null}
        </div>
      </PageContainer>
    </div>
  )
}
