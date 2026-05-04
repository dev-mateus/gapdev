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
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { label: 'Perfil', path: '/perfil', icon: UserRoundCog },
  { label: 'Vagas', path: '/vagas', icon: Newspaper },
  { label: 'Análise', path: '/analise', icon: ChartNoAxesCombined },
  { label: 'Plano de estudos', path: '/plano-estudos', icon: BookOpen },
  { label: 'Progresso', path: '/progresso', icon: ChartColumnIncreasing },
  { label: 'Histórico de Vagas', path: '/historico-vagas', icon: History },
]

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('usuarioLogado')
    window.dispatchEvent(new Event('auth-changed'))
    navigate('/login')
  }

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <button className={styles.sidebarCloseButton} onClick={onClose}>
        <ChevronLeft size={22} />
      </button>

      <div className={styles.sidebarLogoArea}>
        <div className={styles.sidebarLogoBox}>
          <ChartColumnIncreasing size={28} strokeWidth={2.5} />
        </div>

        <div className={styles.sidebarLogoText}>
          <span>Skill</span>
          <span>Progress</span>
        </div>
      </div>

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
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar