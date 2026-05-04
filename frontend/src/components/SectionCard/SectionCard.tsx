import type { ReactNode } from 'react'
import styles from './SectionCard.module.css'

type SectionCardProps = {
  title?: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

function SectionCard({ title, description, icon, children, className }: SectionCardProps) {
  return (
    <section className={`${styles.card} ${className ?? ''}`.trim()}>
      {(title || description || icon) ? (
        <header className={styles.header}>
          {icon ? <span className={styles.icon}>{icon}</span> : null}
          <div className={styles.heading}>
            {title ? <h2 className={styles.title}>{title}</h2> : null}
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
        </header>
      ) : null}
      <div className={styles.body}>{children}</div>
    </section>
  )
}

export default SectionCard
