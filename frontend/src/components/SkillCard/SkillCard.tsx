import { useId } from 'react'
import type { ChangeEvent, ReactNode } from 'react'

import checkboxStyles from '../Checkbox/Checkbox.module.css'
import styles from './SkillCard.module.css'

type SkillCardProps = {
  name: string
  description?: string
  icon?: ReactNode
  selected?: boolean
  onToggle?: (selected: boolean) => void
}

export default function SkillCard({ name, description, icon, selected = false, onToggle }: SkillCardProps) {
  const id = useId()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onToggle?.(event.target.checked)
  }

  return (
    <label className={styles.card} htmlFor={id}>
      <div className={styles.left}>
        <span className={styles.icon} aria-hidden>
          {icon ?? <span className={styles.iconDot} />}
        </span>

        <span className={styles.text}>
          <span className={styles.name}>{name}</span>
          {description ? <span className={styles.description}>{description}</span> : null}
        </span>
      </div>

      <div className={styles.checkboxWrap}>
        <input
          id={id}
          className={checkboxStyles.checkboxInput}
          type="checkbox"
          checked={selected}
          onChange={handleChange}
          onMouseDown={(e) => e.preventDefault()} /* previne scroll ao clicar */
        />
        <span className={checkboxStyles.checkboxBox} aria-hidden="true" />
      </div>
    </label>
  )
}
