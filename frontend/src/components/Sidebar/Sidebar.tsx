import { useState } from 'react'
import {
  UserRoundCog,
  Newspaper,
  BookOpen,
  ChartColumnIncreasing,
  History,
  ChevronLeft,
  LogOut,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'
import LogoutModal from '../logout/LogoutModal'

type SidebarProps = {
  isCollapsed: boolean
  onToggle: () => void
}

const menuItems = [
  { label: 'Perfil', path: '/perfil', icon: UserRoundCog },
  { label: 'Vagas', path: '/vagas', icon: Newspaper },
  { label: 'Plano de estudos', path: '/plano-estudos', icon: BookOpen },
  { label: 'Progresso', path: '/progresso', icon: ChartColumnIncreasing },
  { label: 'Histórico de Vagas', path: '/historico-vagas', icon: History },
]

function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  function handleLogoutClick() {
    setShowLogoutModal(true)
  }

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : styles.expanded}`}>
      <button className={styles.sidebarToggleButton} onClick={onToggle} title={isCollapsed ? 'Expandir' : 'Retrair'}>
        <ChevronLeft size={22} className={isCollapsed ? styles.chevronCollapsed : ''} />
      </button>

      {!isCollapsed && (
        <div className={styles.sidebarLogoArea}>
          <div className={styles.sidebarLogoBox}>
            <ChartColumnIncreasing size={28} strokeWidth={2.5} />
          </div>

          <div className={styles.sidebarLogoText}>
            <span>Skill</span>
            <span>Progress</span>
          </div>
        </div>
      )}

      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.sidebarItem} ${isActive ? styles.active : ''}`
              }
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={22} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutButton} onClick={handleLogoutClick} title="Fazer logout">
          <LogOut size={18} />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </aside>
  )
}

export default Sidebar