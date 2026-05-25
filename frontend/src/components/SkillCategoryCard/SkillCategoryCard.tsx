import { AlertCircle, Lightbulb } from 'lucide-react'
import SectionCard from '../SectionCard/SectionCard'
import styles from './SkillCategoryCard.module.css'
import type { ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  type?: 'required' | 'optional'
  children: ReactNode
}

export default function SkillCategoryCard({ title, description, type = 'required', children }: Props) {
  const icon = type === 'required' ? (
    <div className={`${styles.iconBadge} ${styles.iconRequired}`}>
      <AlertCircle size={20} />
    </div>
  ) : (
    <div className={`${styles.iconBadge} ${styles.iconOptional}`}>
      <Lightbulb size={20} />
    </div>
  )

  return (
    <SectionCard title={title} description={description} icon={icon} className={styles.wrap}>
      <div className={styles.list}>{children}</div>
    </SectionCard>
  )
}
