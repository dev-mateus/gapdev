import { createBrowserRouter } from 'react-router-dom'

import Home from './pages/Home'
import App from './App'
import Perfil from './pages/Perfil'
import Vagas from './pages/Vagas'
import Analise from './pages/Analise'
import PlanoEstudo from './pages/PlanoEstudo'
import Progresso from './pages/Progresso'
import HistoricoVagas from './pages/HistoricoVagas'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'perfil',
        element: <Perfil />,
      },
      {
        path: 'vagas',
        element: <Vagas />,
      },
      {
        path: 'analise',
        element: <Analise />,
      },
      {
        path: 'plano-estudo',
        element: <PlanoEstudo />,
      },
      {
        path: 'progresso',
        element: <Progresso />,
      },
      {
        path: 'historico-vagas',
        element: <HistoricoVagas />,
      },
    ],
  },
])