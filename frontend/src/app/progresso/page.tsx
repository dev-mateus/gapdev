import { useState } from 'react'

import { useStudyPlan } from '../../contexts/StudyPlanContext'
import PageHeader from '../../components/PageHeader/PageHeader'
import PageContainer from '../../components/PageContainer/PageContainer'
import styles from './progresso.module.css'

type SkillProgress = {
  name: string
  percent: number
  status: 'em andamento' | 'iniciando' | 'concluído'
}

function formatPercentBR(value: number) {
  return `${value.toFixed(2).replace('.', ',')}%`
}

export default function ProgressoPage() {
  const { plans } = useStudyPlan()

  const allModules = plans.flatMap((plan) =>
    plan.modules.map((moduleEntry) => ({
      ...moduleEntry,
      planId: plan.id,
      planTitle: plan.title,
    })),
  )

  const allTasks = allModules.flatMap((moduleEntry) =>
    moduleEntry.tasks.map((task) => ({
      ...task,
      planId: moduleEntry.planId,
      moduleId: moduleEntry.id,
      moduleName: moduleEntry.name,
    })),
  )

  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter((task) => task.done).length
  const totalSkills = allModules.length
  const dominatedSkills = allModules.filter(
    (moduleEntry) => moduleEntry.tasks.length > 0 && moduleEntry.tasks.every((task) => task.done),
  ).length
  const dominatedPercent = totalSkills > 0 ? Math.round((dominatedSkills / totalSkills) * 100) : 0

  const skillProgress: SkillProgress[] = allModules
    .map((moduleEntry): SkillProgress => {
      const completedModuleTasks = moduleEntry.tasks.filter((task) => task.done).length
      const percent = moduleEntry.tasks.length
        ? Math.round((completedModuleTasks / moduleEntry.tasks.length) * 100)
        : 0
      const status = percent >= 100 ? 'concluído' : percent >= 40 ? 'em andamento' : 'iniciando'

      return {
        name: `${moduleEntry.name} · ${moduleEntry.planTitle}`,
        percent,
        status,
      }
    })
    // Skills não concluídas ficam no topo; as concluídas vão para o final.
    // Entre as não concluídas, as mais avançadas aparecem primeiro.
    .sort((a, b) => {
      const aDone = a.percent >= 100
      const bDone = b.percent >= 100
      if (aDone !== bDone) {
        return aDone ? 1 : -1
      }
      return b.percent - a.percent
    })

  const SKILLS_VISIVEIS = 6
  const [skillsExpandidas, setSkillsExpandidas] = useState(false)
  const temMaisSkills = skillProgress.length > SKILLS_VISIVEIS
  const skillsVisiveis = skillsExpandidas
    ? skillProgress
    : skillProgress.slice(0, SKILLS_VISIVEIS)

  return (
    <div className={styles.content}>
      <PageContainer className={styles.expandedContainer}>
        <div className={styles.page}>
          <PageHeader
            title="Progresso"
            description="Visualize seu crescimento usando os dados do plano de estudos"
          />

          <section className={styles.cards} aria-label="Resumo do progresso">
            <div className={`${styles.card} ${styles.cardGlass}`}>
              <div className={styles.cardTop}>
                <div className={styles.cardIcon} aria-hidden="true">
                  ✓
                </div>
                <div className={styles.cardMeta}>
                  <h3 className={styles.cardTitle}>Conteúdos concluídos</h3>
                  <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{completedTasks}/{totalTasks}</span>
                    <span className={styles.badgePlus}>Baseado no plano de estudos</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.card} ${styles.cardGlass}`}>
              <div className={styles.cardTop}>
                <div className={styles.ringWrap}>
                  <div className={styles.ring}>
                    <div
                      className={styles.ringFill}
                      style={{ ['--ring-progress' as any]: dominatedPercent }}
                    />
                  </div>
                  <div className={styles.ringCenter}>
                    <div className={styles.ringNumber}>
                      {dominatedSkills}/{totalSkills}
                    </div>
                    <div className={styles.ringSub}>{formatPercentBR(dominatedPercent)} </div>
                  </div>
                </div>

                <div className={styles.cardMeta}>
                  <h3 className={styles.cardTitle}>Skills dominadas</h3>
                </div>
              </div>
            </div>
          </section>

          <section className={`${styles.panel} ${styles.panelGlass}`}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Progresso por skill</h2>
              <p className={styles.panelSubtitle}>Dados extraídos diretamente do plano de estudos</p>
            </div>

            <div className={styles.skillList}>
              {skillsVisiveis.map((skill) => {
                const isDone = skill.percent >= 100

                return (
                  <div key={skill.name} className={styles.skillRow}>
                    <div className={styles.skillTop}>
                      <div className={styles.skillName}>
                        {skill.name}
                        {isDone ? <span className={styles.check} aria-label="Concluído">✓</span> : null}
                      </div>
                      <div className={styles.skillPercent}>{skill.percent}%</div>
                    </div>

                    <div className={styles.progressTrack} aria-hidden="true">
                      <div
                        className={styles.progressFill}
                        style={{ width: `${skill.percent}%` }}
                        data-done={isDone ? 'true' : 'false'}
                      />
                    </div>

                    <div className={styles.skillStatus}>
                      {skill.status === 'concluído'
                        ? 'Concluído'
                        : skill.status === 'iniciando'
                          ? 'Iniciando'
                          : 'Em andamento'}
                    </div>
                  </div>
                )
              })}
            </div>

            {temMaisSkills ? (
              <button
                type="button"
                className={styles.verMaisButton}
                onClick={() => setSkillsExpandidas((atual) => !atual)}
              >
                {skillsExpandidas
                  ? 'Ver menos'
                  : `Ver mais (${skillProgress.length - SKILLS_VISIVEIS})`}
              </button>
            ) : null}
          </section>
        </div>
      </PageContainer>
    </div>
  )
}