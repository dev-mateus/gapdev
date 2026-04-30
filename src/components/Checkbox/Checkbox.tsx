import { useId } from 'react'
import type { ChangeEvent } from 'react'
import styles from './Checkbox.module.css'

type CheckboxProps = {
  label: string
  checked?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  error?: string
}

function Checkbox({ label, checked, onChange, error }: CheckboxProps) {
  const id = useId()

  return (
    <div className={styles.checkboxWrapper}>
      <label className={styles.checkbox} htmlFor={id}>
        <input id={id} className={styles.checkboxInput} type="checkbox" checked={checked} onChange={onChange} />
        <span className={styles.checkboxBox} aria-hidden="true" />
        <span className={styles.checkboxLabel}>{label}</span>
      </label>
      {error && <span className={styles.checkboxError}>{error}</span>}
    </div>
  )
}

export default Checkbox
