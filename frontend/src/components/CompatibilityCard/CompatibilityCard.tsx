import { BriefcaseBusiness } from 'lucide-react'
import styles from './CompatibilityCard.module.css'

type Props = {
  title: string
  compatibility: number
}

export default function CompatibilityCard({ title, compatibility }: Props) {
  const percent = Math.max(0, Math.min(100, Math.round(compatibility)))

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <div className={styles.icon}>
          <BriefcaseBusiness size={24} />
        </div>
        <div className={styles.titleWrap}>
          <div className={styles.title}>{title}</div>
          <div className={styles.subtitle}>Vaga analisada</div>
        </div>
      </div>

      <div className={styles.right}>
        <span className={styles.percentage}>{percent}%</span>
        <span className={styles.label}>Compatibilidade</span>
      </div>
    </div>
  )
}
