import SkillCard from '../SkillCard/SkillCard'

type Props = {
  name: string
  description?: string
  selected?: boolean
  onToggle?: (selected: boolean) => void
}

export default function SkillSelectableCard({ name, description, selected = false, onToggle }: Props) {
  const handleToggle = (value: boolean) => {
    onToggle?.(value)
  }

  return <SkillCard name={name} description={description} selected={selected} onToggle={handleToggle} />
}
