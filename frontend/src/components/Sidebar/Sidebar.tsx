import {
  UserRoundCog,
  Newspaper,
  ChartNoAxesCombined,
  BookOpen,
  ChartColumnIncreasing,
  History,
  ChevronLeft,
  LogOut,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import styles from './Sidebar.module.css'

type SidebarProps = {
  isCollapsed: boolean
  onToggle: () => void
}

const menuItems = [
  { label: 'Perfil', path: '/perfil', icon: UserRoundCog },
  { label: 'Vagas', path: '/vagas', icon: Newspaper },
  { label: 'Análise', path: '/analise', icon: ChartNoAxesCombined },
  { label: 'Plano de estudos', path: '/plano-estudos', icon: BookOpen },
  { label: 'Progresso', path: '/progresso', icon: ChartColumnIncreasing },
  { label: 'Histórico de Vagas', path: '/historico-vagas', icon: History },
]

function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('usuarioLogado')
    window.dispatchEvent(new Event('auth-changed'))
    navigate('/login')
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
        <button className={styles.logoutButton} onClick={handleLogout} title="Fazer logout">
          <LogOut size={18} />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar