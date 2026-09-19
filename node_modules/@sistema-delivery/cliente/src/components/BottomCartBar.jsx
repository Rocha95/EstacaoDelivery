import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function BottomCartBar() {
  const navigate = useNavigate()
  const { quantidadeTotal, subtotal } = useCart()

  if (quantidadeTotal === 0) return null

  return (
    <div className="bottom-cart-bar">
      <button className="inner" style={{ width: '100%', border: 'none' }} onClick={() => navigate('/carrinho')}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="count">{quantidadeTotal}</span>
          Ver carrinho
        </span>
        <span className="money" style={{ fontFamily: 'var(--font-mono)' }}>R$ {subtotal.toFixed(2)}</span>
      </button>
    </div>
  )
}
