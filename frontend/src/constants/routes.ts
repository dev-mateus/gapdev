import LoginPage from '../app/login/page'
import CadastroPage from '../app/cadastro/page'
import HistoricoPage from '../app/historico-vagas/page'
import VagasPage from '../app/vagas/page'

export const ROUTES = {
  '/': LoginPage,
  '/login': LoginPage,
  '/cadastro': CadastroPage,
  '/historico-vagas': HistoricoPage,
  '/vagas': VagasPage,
}
