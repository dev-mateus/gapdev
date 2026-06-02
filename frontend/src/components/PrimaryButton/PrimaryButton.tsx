import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Button from '../Button/Button'

type PrimaryButtonProps = {
  children: ReactNode
  icon?: ReactNode
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

function PrimaryButton({ children, icon, size = 'medium', loading, ...buttonProps }: PrimaryButtonProps) {
  return (
    <Button variant="primary" size={size} icon={icon} loading={loading} {...buttonProps}>
      {children}
    </Button>
  )
}

export default PrimaryButton
