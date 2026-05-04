import type { ReactNode } from 'react'
import styles from './PageContainer.module.css'

type PageContainerProps = {
  children: ReactNode
  className?: string
}

function PageContainer({ children, className }: PageContainerProps) {
  return <div className={`${styles.pageContainer} ${className ?? ''}`.trim()}>{children}</div>
}

export default PageContainer
