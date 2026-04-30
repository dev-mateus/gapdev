import {
  UserRoundCog,
  Newspaper,
  ChartNoAxesCombined,
  BookOpen,
  ChartColumnIncreasing,
  History,
  ChevronLeft,
} from 'lucide-react'

import './Sidebar.module.css'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  {
    label: 'Perfil',
    path: '/perfil',
    icon: UserRoundCog,
  },
  {
    label: 'Vagas',
    path: '/vagas',
    icon: Newspaper,
  },
  {
    label: 'Análise',
    path: '/analise',
    icon: ChartNoAxesCombined,
  },
  {
    label: 'Plano de estudos',
    path: '/plano-estudos',
    icon: BookOpen,
  },
  {
    label: 'Progresso',
    path: '/progresso',
    icon: ChartColumnIncreasing,
  },
  {
    label: 'Histórico de Vagas',
    path: '/historico-vagas',
    icon: History,
  },
]

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const currentPath = window.location.pathname

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <button className="sidebar-close-button" onClick={onClose}>
        <ChevronLeft size={22} />
      </button>

      <div className="sidebar-logo-area">
        <div className="sidebar-logo-box">
          <ChartColumnIncreasing size={28} strokeWidth={2.5} />
        </div>

        <div className="sidebar-logo-text">
          <span>Skill</span>
          <span>Progress</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.path

          return (
            <a
              key={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              href={item.path}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </a>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar