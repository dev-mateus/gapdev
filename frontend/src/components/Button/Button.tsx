import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type ButtonProps = {
  variant: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  icon?: ReactNode
  loading?: boolean
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

function Button({ variant, size = 'medium', icon, loading, className, children, ...buttonProps }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[`size${size[0].toUpperCase()}${size.slice(1)}`]} ${variant === 'primary' ? styles.primaryButton : styles.secondaryButton} ${className ?? ''}`}
      disabled={loading ?? buttonProps.disabled}
      {...buttonProps}
    >
      {loading ? (
        <span className={styles.buttonSpinner} aria-hidden="true" />
      ) : icon ? (
        <span className={styles.buttonIcon}>{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  )
}

export default Button