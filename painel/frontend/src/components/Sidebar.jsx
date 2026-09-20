import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')

const NAV_GROUPS = [
  {
    label: 'Visão geral',
    items: [
      { to: '/', icon: '◆', label: 'Dashboard', end: true },
      { to: '/pedidos', icon: '🧾', label: 'Pedidos' },
      { to: '/cozinha', icon: '👨‍🍳', label: 'KDS / Cozinha' },
      { to: '/relatorios', icon: '📊', label: 'Relatórios' },
    ],
  },
  {
    label: 'Cardápio',
    items: [
      { to: '/produtos', icon: '🍔', label: 'Produtos' },
      { to: '/categorias', icon: '🗂', label: 'Categorias' },
      { to: '/adicionais', icon: '➕', label: 'Adicionais' },
      { to: '/combos', icon: '🎁', label: 'Combos' },
      { to: '/estoque', icon: '📦', label: 'Estoque' },
    ],
  },
  {
    label: 'Operação',
    items: [
      { to: '/horarios', icon: '🕒', label: 'Horários' },
      { to: '/cupons', icon: '🏷', label: 'Cupons' },
      { to: '/taxas-entrega', icon: '🛵', label: 'Taxas de entrega' },
      { to: '/clientes', icon: '👥', label: 'Clientes' },
      { to: '/avaliacoes', icon: '⭐', label: 'Avaliações' },
    ],
  },
  {
    label: 'Administração',
    items: [
      { to: '/usuarios', icon: '🔐', label: 'Usuários' },
      { to: '/configuracoes', icon: '⚙️', label: 'Configurações' },
      { to: '/estabelecimentos', icon: '🏪', label: 'Estabelecimentos' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="mark">#</span>
        <span className="name">Estação Delivery</span>
      </div>
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="sidebar-section-label">{group.label}</div>
          {group.items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  )
}
