import { BriefcaseBusiness, ClipboardList, Plus } from 'lucide-react'
import PageContainer from '../../components/PageContainer/PageContainer'
import PageHeader from '../../components/PageHeader/PageHeader'
import SectionCard from '../../components/SectionCard/SectionCard'
import TabSwitcher, { type TabSwitcherItem } from '../../components/TabSwitcher/TabSwitcher'
import Input from '../../components/Input/Input'
import TextArea from '../../components/TextArea/TextArea'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton'
import { useAnalisarVagaForm } from './hooks/useAnalisarVagaForm'
import styles from './vagas.module.css'

const tabs: TabSwitcherItem[] = [
  { id: 'analisar-vaga', label: 'Analisar vaga', href: '/vagas' },
  { id: 'minhas-vagas', label: 'Minhas vagas', href: '/historico-vagas' },
]

function navigateTo(path: string) {
  if (window.location.pathname === path) {
    return
  }

  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function VagasPage() {
  function handleAnalysisSuccess(title: string, description: string, jobId: string) {
    const analysisContext = JSON.stringify({ title, description })
    window.sessionStorage.setItem(`analysis:${jobId}`, analysisContext)

    const params = new URLSearchParams()
    params.set('jobId', jobId)
    navigateTo(`/compatibility?${params.toString()}`)
  }

  const { formState, isSubmitting, statusMessage, statusType, updateField, handleSubmit } = useAnalisarVagaForm(handleAnalysisSuccess)

  function handleTabChange(tab: TabSwitcherItem) {
    if (!tab.href) {
      return
    }

    navigateTo(tab.href)
  }

  return (
    <div className={styles.content}>
        <PageContainer className={styles.expandedContainer}>
          <div className={styles.pageStack}>
            <PageHeader
              title="Vagas"
              description="Adicione vagas de interesse para salvar no seu historico."
            />

            <TabSwitcher tabs={tabs} activeTabId="analisar-vaga" onTabChange={handleTabChange} />

            <SectionCard
              title="Analisar vaga"
              description="Cole a descricao completa da vaga e analise com a IA."
              icon={<ClipboardList size={20} />}
            >
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.row}>
                  <Input
                    label="Titulo da vaga"
                    type="text"
                    placeholder="Ex: Desenvolvedor Backend Pleno"
                    value={formState.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    startIcon={<BriefcaseBusiness size={18} />}
                    required
                  />

                  <Input
                    label="Empresa"
                    type="text"
                    placeholder="Nome da empresa"
                    value={formState.company}
                    onChange={(event) => updateField('company', event.target.value)}
                    required
                  />
                </div>

                <TextArea
                  label="Descricao da vaga"
                  placeholder="Cole aqui a descricao da vaga, com requisitos tecnicos, tecnologias e ferramentas necessarias"
                  value={formState.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  required
                />

                {statusMessage ? (
                  <p className={`${styles.formMessage} ${statusType === 'success' ? styles.formMessageSuccess : styles.formMessageError}`}>
                    {statusMessage}
                  </p>
                ) : null}

                <div className={styles.actions}>
                  <PrimaryButton type="submit" icon={<Plus />} className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? 'Analisando vaga...' : 'Analisar vaga'}
                  </PrimaryButton>
                </div>
              </form>
            </SectionCard>
          </div>
        </PageContainer>
    </div>
  )
}

export default VagasPage
