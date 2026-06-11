import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'
import {
  SIDEBAR_NAV_LINKS,
  type SidebarNavItem,
} from '../../constants/navigation'
import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
  History,
} from 'lucide-react'

type NavIconProps = { iconKey: SidebarNavItem['iconKey'] }

function NavIcon({ iconKey }: NavIconProps) {
  const props = { size: 22, strokeWidth: 2.25 } as const

  switch (iconKey) {
    case 'profile':
      return <BarChart3 {...props} />
    case 'jobs':
      return <BriefcaseBusiness {...props} />
    case 'analysis':
      return <ClipboardCheck {...props} />
    case 'studyPlan':
      return <BookOpen {...props} />
    case 'progress':
      return <TrendingUp {...props} />
    case 'jobsHistory':
      return <History {...props} />
    default:
      return <BarChart3 {...props} />
  }
}

export default function BottomNav() {
  return (
    <nav className={styles.bottomNav} aria-label="Navegação inferior">
      {SIDEBAR_NAV_LINKS.map((item) => (
        <NavLink
          key={item.id}
          to={item.href}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.iconWrap}>
            <NavIcon iconKey={item.iconKey} />
          </span>
          <span className={styles.label}>{item.label.split(' ')[0]}</span>
        </NavLink>
      ))}
    </nav>
  )
}

