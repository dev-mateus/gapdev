const JOB_LEVEL_LABELS: Record<string, string> = {
  Intern: 'Estágio',
  Junior: 'Júnior',
  MidLevel: 'Pleno',
  Senior: 'Sênior',
}

/**
 * Map a stored JobLevel enum value (e.g. "MidLevel") to its Portuguese label.
 * Returns 'Não informado' when the level is missing or unknown.
 */
export function jobLevelLabel(level?: string | null): string {
  if (!level) {
    return 'Não informado'
  }

  return JOB_LEVEL_LABELS[level] ?? level
}
