import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarPedidoPorId, consultarPagamento } from '../services/api'
import { useCart } from '../context/CartContext'

export default function CheckoutConfirmacao() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { limparCarrinho } = useCart()
  const [pedido, setPedido] = useState(null)
  const [erro, setErro] = useState('')
  const [pagamento, setPagamento] = useState(null)

  useEffect(() => {
    buscarPedidoPorId(id)
      .then((pedidoData) => { setPedido(pedidoData); if (pedidoData.formaPagamento === 'PIX') consultarPagamento(id).then(setPagamento).catch(() => {}) })
      .then(() => limparCarrinho())
      .catch((err) => setErro(err.message || 'Não foi possível carregar o pedido.'))
  }, [id])

  if (erro) return <div className="app-frame"><div className="content">{erro}<button className="btn-block btn-primary" onClick={() => navigate('/historico')}>Ver pedidos</button></div></div>
  if (!pedido) return <div className="app-frame"><div className="content" style={{ textAlign: 'center', paddingTop: 50 }}>Carregando pedido...</div></div>

  return (
    <div className="app-frame" style={{ justifyContent: 'center' }}>
      <div className="content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 14 }}>✅</div>
        <h2 style={{ margin: '0 0 6px' }}>Pedido enviado!</h2>
        <p style={{ color: '#8A867C', fontSize: 13.5, marginBottom: 6 }}>
          Pedido <span className="order-id">#{pedido.numero}</span> recebido pelo estabelecimento.
        </p>
        <p style={{ color: '#8A867C', fontSize: 12.5, marginBottom: 26 }}>Total: R$ {Number(pedido.total).toFixed(2)}</p>

        {pagamento?.status === 'PENDENTE' && (pagamento.qrCodeBase64 || pagamento.copiaECola) && (
          <div className="card" style={{ width: '100%', maxWidth: 360, marginBottom: 16 }}>
            <strong>Pagamento via Pix</strong>
            {pagamento.qrCodeBase64 && <img src={`data:image/png;base64,${pagamento.qrCodeBase64}`} alt="QR Code Pix" style={{ width: 220, height: 220, objectFit: 'contain', display: 'block', margin: '12px auto' }} />}
            {pagamento.copiaECola && <textarea readOnly value={pagamento.copiaECola} style={{ width: '100%', minHeight: 80 }} />}
            <button className="btn-block btn-primary" onClick={() => navigator.clipboard?.writeText(pagamento.copiaECola || '')}>Copiar Pix</button>
          </div>
        )}
        <button className="btn-block btn-primary" onClick={() => navigate(`/pedido/${pedido.id}`)}>Acompanhar pedido</button>
      </div>
    </div>
  )
}
