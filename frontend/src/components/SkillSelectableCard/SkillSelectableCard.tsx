import SkillCard from '../SkillCard/SkillCard'

type Props = {
  name: string
  description?: string
  selected?: boolean
  onToggle?: (selected: boolean) => void
  syncing?: boolean
  disabled?: boolean
}

export default function SkillSelectableCard({ name, description, selected = false, onToggle, syncing = false, disabled = false }: Props) {
  const handleToggle = (value: boolean) => {
    onToggle?.(value)
  }

  return <SkillCard name={name} description={description} selected={selected} onToggle={handleToggle} syncing={syncing} disabled={disabled} />
}
