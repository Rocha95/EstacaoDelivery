import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) => (isActive ? 'active' : '')

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={linkClass}>
        <span className="icon">🍽</span>Cardápio
      </NavLink>
      <NavLink to="/historico" className={linkClass}>
        <span className="icon">🧾</span>Pedidos
      </NavLink>
      <NavLink to="/enderecos" className={linkClass}>
        <span className="icon">📍</span>Endereços
      </NavLink>
      <NavLink to="/perfil" className={linkClass}>
        <span className="icon">👤</span>Perfil
      </NavLink>
    </nav>
  )
}
