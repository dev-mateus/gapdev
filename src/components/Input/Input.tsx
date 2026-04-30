import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './Input.module.css'

type InputProps = {
  label: string
  type: 'text' | 'password'
  placeholder: string
  startIcon?: ReactNode
  endIcon?: ReactNode
  endIconLabel?: string
  onEndIconClick?: () => void
  error?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'placeholder'>

function Input({
  label,
  placeholder,
  startIcon,
  endIcon,
  endIconLabel,
  onEndIconClick,
  type,
  className,
  error,
  ...inputProps
}: InputProps) {
  const id = useId()

  return (
    <label className={`${styles.field} ${className ?? ''}`} htmlFor={id}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={`${styles.inputShell} ${error ? styles.inputShellError : ''}`}>
        {startIcon ? <span className={styles.inputIcon}>{startIcon}</span> : null}
        <input
          id={id}
          className={styles.input}
          type={type}
          placeholder={placeholder}
          {...inputProps}
        />
        {endIcon ? (
          onEndIconClick ? (
            <button
              type="button"
              className={styles.iconButton}
              onClick={onEndIconClick}
              aria-label={endIconLabel}
            >
              {endIcon}
            </button>
          ) : (
            <span className={styles.inputIcon}>{endIcon}</span>
          )
        ) : null}
      </span>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </label>
  )
}

export default Input