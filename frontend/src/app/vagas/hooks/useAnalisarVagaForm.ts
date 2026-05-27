import { useState, type FormEvent } from 'react'
import { submitJobForAnalysis } from '../services/analisarVagaService'
import type { AnalyzeJobFormState } from '../types/analisarVaga'

const initialState: AnalyzeJobFormState = {
  title: '',
  company: '',
  seniority: '',
  description: '',
}

const validSeniorities = ['Intern', 'Junior', 'MidLevel', 'Senior']

function getErrorMessage(state: AnalyzeJobFormState): string {
  if (!state.title.trim()) return 'Informe o título da vaga.'
  if (!state.company.trim()) return 'Informe a empresa da vaga.'
  if (!state.seniority.trim()) return 'Selecione a senioridade da vaga.'

  if (!validSeniorities.includes(state.seniority)) {
    return 'Senioridade inválida.'
  }

  if (!state.description.trim()) return 'Cole a descrição completa da vaga.'

  return ''
}

export function useAnalisarVagaForm(
  onSuccess?: (title: string, description: string, jobId: string) => void,
) {
  const [formState, setFormState] = useState<AnalyzeJobFormState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState<'error' | 'success' | ''>('')

  function updateField<K extends keyof AnalyzeJobFormState>(
    field: K,
    value: AnalyzeJobFormState[K],
  ) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    console.log('submit disparou', formState)  

    const errorMessage = getErrorMessage(formState)

    if (errorMessage) {
      setStatusType('error')
      setStatusMessage(errorMessage)
      return
    }

    setIsSubmitting(true)
    setStatusMessage('')
    setStatusType('')

    try {
      const title = formState.title.trim()
      const company = formState.company.trim()
      const seniority = formState.seniority.trim()
      const description = formState.description.trim()

      const response = await submitJobForAnalysis({
        title,
        company,
        seniority,
        description,
      })

      setStatusType('success')
      setStatusMessage(response.message)

      onSuccess?.(title, description, response.jobId)
      setFormState(initialState)
    } catch (error) {
      setStatusType('error')
      setStatusMessage(
        error instanceof Error ? error.message : 'Não foi possível salvar a vaga.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formState,
    isSubmitting,
    statusMessage,
    statusType,
    updateField,
    handleSubmit,
  }
}