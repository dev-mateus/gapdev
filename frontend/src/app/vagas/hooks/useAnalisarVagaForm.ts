import { useState, type FormEvent } from 'react'
import { submitJobForAnalysis } from '../services/analisarVagaService'
import type { AnalyzeJobFormState } from '../types/analisarVaga'

const initialState: AnalyzeJobFormState = {
  title: '',
  company: '',
  description: '',
}

function getErrorMessage(state: AnalyzeJobFormState): string {
  if (!state.title.trim()) {
    return 'Informe o titulo da vaga.'
  }

  if (!state.company.trim()) {
    return 'Informe a empresa da vaga.'
  }

  if (!state.description.trim()) {
    return 'Cole a descricao completa da vaga.'
  }

  return ''
}

export function useAnalisarVagaForm(onSuccess?: (title: string, description: string, jobId: string) => void) {
  const [formState, setFormState] = useState<AnalyzeJobFormState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState<'error' | 'success' | ''>('')

  function updateField<K extends keyof AnalyzeJobFormState>(field: K, value: AnalyzeJobFormState[K]) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

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
      const response = await submitJobForAnalysis({
        title: formState.title.trim(),
        company: formState.company.trim(),
        description: formState.description.trim(),
      })

      setStatusType('success')
      setStatusMessage(response.message)
      
      onSuccess?.(formState.title.trim(), formState.description.trim(), response.jobId)
      setFormState(initialState)
    } catch (error) {
      setStatusType('error')
      setStatusMessage(error instanceof Error ? error.message : 'Nao foi possivel salvar a vaga.')
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
