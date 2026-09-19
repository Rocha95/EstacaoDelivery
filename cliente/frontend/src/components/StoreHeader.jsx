import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function StoreHeader() {
  const navigate = useNavigate()
  const { quantidadeTotal } = useCart()

  return (
    <div className="store-header">
      <div className="row">
        <div>
          <div className="mark">#ESTAÇÃO</div>
          <div className="store-name">Estação Delivery</div>
          <div className="store-meta">Av. Presidente Vargas, 450 · 30–45 min</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="header-pill open"><span className="dot" />Aberto</span>
          <button className="icon-btn" onClick={() => navigate('/carrinho')}>
            🛒
            {quantidadeTotal > 0 && <span className="cart-badge">{quantidadeTotal}</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
