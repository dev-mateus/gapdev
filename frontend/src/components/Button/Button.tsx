import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type ButtonProps = {
  variant: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  icon?: ReactNode
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

function Button({ variant, size = 'medium', icon, className, children, ...buttonProps }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[`size${size[0].toUpperCase()}${size.slice(1)}`]} ${variant === 'primary' ? styles.primaryButton : styles.secondaryButton} ${className ?? ''}`}
      {...buttonProps}
    >
      {icon ? <span className={styles.buttonIcon}>{icon}</span> : null}
      <span>{children}</span>
    </button>
  )
}

export default Button