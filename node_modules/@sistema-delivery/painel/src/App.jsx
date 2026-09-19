import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'

import Dashboard from './pages/Dashboard'
import Pedidos from './pages/Pedidos'
import Produtos from './pages/Produtos'
import Categorias from './pages/Categorias'
import Adicionais from './pages/Adicionais'
import Combos from './pages/Combos'
import Horarios from './pages/Horarios'
import Cupons from './pages/Cupons'
import TaxasEntrega from './pages/TaxasEntrega'
import Clientes from './pages/Clientes'
import Configuracoes from './pages/Configuracoes'
import Usuarios from './pages/Usuarios'
import Relatorios from './pages/Relatorios'

const PAGES = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral do turno de hoje', Component: Dashboard },
  '/pedidos': { title: 'Pedidos', subtitle: 'Acompanhe e atualize o status de cada pedido', Component: Pedidos },
  '/produtos': { title: 'Produtos', subtitle: 'Cadastre itens, preços e disponibilidade', Component: Produtos },
  '/categorias': { title: 'Categorias', subtitle: 'Organize o cardápio em seções', Component: Categorias },
  '/adicionais': { title: 'Adicionais', subtitle: 'Itens extras que o cliente pode incluir no pedido', Component: Adicionais },
  '/combos': { title: 'Combos', subtitle: 'Agrupe produtos com preço especial', Component: Combos },
  '/horarios': { title: 'Horários', subtitle: 'Defina quando o estabelecimento aceita pedidos', Component: Horarios },
  '/cupons': { title: 'Cupons', subtitle: 'Crie descontos para campanhas e clientes', Component: Cupons },
  '/taxas-entrega': { title: 'Taxas de entrega', subtitle: 'Valores de frete por distância do estabelecimento', Component: TaxasEntrega },
  '/clientes': { title: 'Clientes', subtitle: 'Histórico e dados de quem já comprou com você', Component: Clientes },
  '/usuarios': { title: 'Usuários', subtitle: 'Quem tem acesso ao painel e com qual permissão', Component: Usuarios },
  '/configuracoes': { title: 'Configurações', subtitle: 'Dados do estabelecimento e preferências gerais', Component: Configuracoes },
  '/relatorios': { title: 'Relatórios', subtitle: 'Desempenho de vendas e operação', Component: Relatorios },
}

function PageShell({ path }) {
  const { title, subtitle, Component } = PAGES[path]
  return (
    <>
      <Topbar title={title} subtitle={subtitle} />
      <div className="page-content">
        <Component />
      </div>
    </>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-col">
        <Routes>
          {Object.keys(PAGES).map((path) => (
            <Route key={path} path={path} element={<PageShell path={path} />} />
          ))}
        </Routes>
      </div>
    </div>
  )
}
