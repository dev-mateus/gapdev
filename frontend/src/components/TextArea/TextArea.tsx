import { useId } from 'react'
import type { ReactNode, TextareaHTMLAttributes } from 'react'
import styles from './TextArea.module.css'

type TextAreaProps = {
  label: string
  placeholder: string
  startIcon?: ReactNode
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'>

function TextArea({ label, placeholder, startIcon, className, ...textAreaProps }: TextAreaProps) {
  const id = useId()

  return (
    <label className={`${styles.field} ${className ?? ''}`.trim()} htmlFor={id}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.textareaShell}>
        {startIcon ? <span className={styles.inputIcon}>{startIcon}</span> : null}
        <textarea id={id} className={styles.textarea} placeholder={placeholder} {...textAreaProps} />
      </span>
    </label>
  )
}

export default TextArea
