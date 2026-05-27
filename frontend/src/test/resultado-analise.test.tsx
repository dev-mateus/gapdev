import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import ResultadoAnalisePage from '../app/resultado-analise/page'
import { apiPatch } from '../services/api'

const navigateMock = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('../services/api', () => ({
  apiPatch: vi.fn(),
}))

function seedAnalysisResult() {
  window.sessionStorage.setItem(
    'analysisResult',
    JSON.stringify({
      jobId: 'job-123',
      jobTitle: 'Desenvolvedor Backend Pleno',
      company: 'Google',
      compatibility: 75,
      userLevel: 'Intermediário',
      jobLevel: 'Pleno',
      hasSkills: ['JavaScript', 'Node.js'],
      needSkills: ['Docker', 'AWS'],
      recommendation: 'Foque em Docker e AWS.',
    })
  )
}

describe('ResultadoAnalisePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.sessionStorage.clear()
  })

  it('mostra os dados da análise carregados do sessionStorage', async () => {
    seedAnalysisResult()

    render(<ResultadoAnalisePage />)

    expect(screen.getByText('Carregando análise...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Resultado da Análise')).toBeInTheDocument()
    })

    expect(screen.getByText('Desenvolvedor Backend Pleno')).toBeInTheDocument()
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('Seu nível atual')).toBeInTheDocument()
    expect(screen.getByText('Intermediário')).toBeInTheDocument()
  })

  it('salva a vaga no backend e redireciona para histórico', async () => {
    seedAnalysisResult()
    const apiPatchMock = apiPatch as Mock
    apiPatchMock.mockResolvedValueOnce({})

    render(<ResultadoAnalisePage />)

    await waitFor(() => {
      expect(screen.getByText('Salvar Vaga')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Vaga' }))

    await waitFor(() => {
      expect(apiPatchMock).toHaveBeenCalledWith('/jobs/job-123/compatibility', { compatibility: 75 })
    })

    expect(navigateMock).toHaveBeenCalledWith('/historico-vagas', { replace: true })
  })
})
