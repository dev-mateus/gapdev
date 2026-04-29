import './Sidebar.css'
import { NavLink } from 'react-router-dom'
import {
  User,
  Briefcase,
  Search,
  BookOpen,
  BarChart3,
  History,
} from 'lucide-react'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logoArea">
        <div className="logoBox">Logo</div>

        <div className="logoText">
          <span>Skill</span>
          <span>Progress</span>
        </div>
      </div>

      <nav className="menuSection">
        <NavLink to="/perfil" className={({ isActive }) => isActive ? 'menuItem active' : 'menuItem'}>
          <User size={22} />
          <span>Perfil</span>
        </NavLink>

        <NavLink to="/vagas" className={({ isActive }) => isActive ? 'menuItem active' : 'menuItem'}>
          <Briefcase size={22} />
          <span>Vagas</span>
        </NavLink>

        <NavLink to="/analise" className={({ isActive }) => isActive ? 'menuItem active' : 'menuItem'}>
          <Search size={22} />
          <span>Análise</span>
        </NavLink>

        <NavLink to="/plano-estudo" className={({ isActive }) => isActive ? 'menuItem active' : 'menuItem'}>
          <BookOpen size={22} />
          <span>Plano de estudos</span>
        </NavLink>

        <NavLink to="/progresso" className={({ isActive }) => isActive ? 'menuItem active' : 'menuItem'}>
          <BarChart3 size={22} />
          <span>Progresso</span>
        </NavLink>

        <NavLink to="/historico-vagas" className={({ isActive }) => isActive ? 'menuItem active' : 'menuItem'}>
          <History size={22} />
          <span>Histórico de vagas</span>
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar