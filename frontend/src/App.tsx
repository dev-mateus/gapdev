import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import './App.css'

function App() {
  return (
    <div className="app">
      <Sidebar />

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export default App