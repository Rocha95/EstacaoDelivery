import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CheckoutConfirmacao() {
  const navigate = useNavigate()
  const { limparCarrinho } = useCart()
  const numeroPedido = '10' + Math.floor(400 + Math.random() * 99)

  const acompanhar = () => {
    limparCarrinho()
    navigate(`/pedido/${numeroPedido}`)
  }

  return (
    <div className="app-frame" style={{ justifyContent: 'center' }}>
      <div className="content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 14 }}>✅</div>
        <h2 style={{ margin: '0 0 6px' }}>Pedido enviado!</h2>
        <p style={{ color: '#8A867C', fontSize: 13.5, marginBottom: 6 }}>
          Seu pedido <span className="order-id" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{numeroPedido}</span> foi recebido pelo estabelecimento.
        </p>
        <p style={{ color: '#8A867C', fontSize: 12.5, marginBottom: 26 }}>Tempo estimado: 35–45 minutos</p>
        <button className="btn-block btn-primary" onClick={acompanhar}>Acompanhar pedido</button>
      </div>
    </div>
  )
}
