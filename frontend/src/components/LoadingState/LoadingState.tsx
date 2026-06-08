import styles from './LoadingState.module.css'

type LoadingStateProps = {
  message?: string
  className?: string
}

export default function LoadingState({ message = 'Carregando...', className }: LoadingStateProps) {
  return (
    <div className={`${styles.container} ${className ?? ''}`} role="status" aria-label={message}>
      <div className={styles.inner}>
        <div className={styles.spinnerWrapper}>
          <div className={styles.glow} />
          <div className={styles.ringOuter} />
          <div className={styles.ringInner} />
        </div>

        <div className={styles.textRow}>
          <p className={styles.message}>{message}</p>
          <span className={styles.dots} aria-hidden="true">
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </span>
        </div>
      </div>
    </div>
  )
}
