import { useId } from 'react'
import type { ChangeEvent, ReactNode } from 'react'

import checkboxStyles from '../Checkbox/Checkbox.module.css'
import styles from './SkillCard.module.css'

type SkillCardProps = {
  name: string
  icon?: ReactNode
  selected: boolean
  onToggle?: (selected: boolean) => void
}

export default function SkillCard({ name, icon, selected = false, onToggle, }: SkillCardProps) {
  const id = useId()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onToggle?.(event.target.checked)
  }

  return (
    <label className={styles.card} htmlFor={id}>
      <div className={styles.left}>
        {icon ? (
          <span className={styles.icon} aria-hidden>
            {icon}
          </span>
        ) : (
          <span className={styles.iconPlaceholder} />
        )}

        <span className={styles.name}>{name}</span>
      </div>

      <div className={styles.checkboxWrap}>
        <input
          id={id}
          className={checkboxStyles.checkboxInput}
          type="checkbox"
          checked={selected}
          onChange={handleChange}
        />
        <span className={checkboxStyles.checkboxBox} aria-hidden="true" />
      </div>
    </label>
  )
}
