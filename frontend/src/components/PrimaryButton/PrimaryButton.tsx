import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Button from '../Button/Button'

type PrimaryButtonProps = {
  children: ReactNode
  icon?: ReactNode
  size?: 'small' | 'medium' | 'large'
} & ButtonHTMLAttributes<HTMLButtonElement>

function PrimaryButton({ children, icon, size = 'medium', ...buttonProps }: PrimaryButtonProps) {
  return (
    <Button variant="primary" size={size} icon={icon} {...buttonProps}>
      {children}
    </Button>
  )
}

export default PrimaryButton
