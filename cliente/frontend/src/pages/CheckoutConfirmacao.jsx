import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarPedidoPorId, consultarPagamento } from '../services/api'
import { useCart } from '../context/CartContext'

function formatarTempo(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutos = Math.floor(total / 60).toString().padStart(2, '0')
  const segundos = (total % 60).toString().padStart(2, '0')
  return `${minutos}:${segundos}`
}

export default function CheckoutConfirmacao() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { limparCarrinho } = useCart()
  const [pedido, setPedido] = useState(null)
  const [erro, setErro] = useState('')
  const [pagamento, setPagamento] = useState(null)
  const [agora, setAgora] = useState(Date.now())

  useEffect(() => {
    let ativo = true
    const carregar = async () => {
      try {
        const pedidoData = await buscarPedidoPorId(id)
        if (!ativo) return
        setPedido(pedidoData)
        if (pedidoData.formaPagamento === 'PIX') {
          const pagamentoData = await consultarPagamento(id)
          if (ativo) setPagamento(pagamentoData)
        }
      } catch (err) {
        if (ativo) setErro(err.message || 'Não foi possível carregar o pedido.')
      }
    }
    carregar()
    limparCarrinho()
    const timer = setInterval(() => setAgora(Date.now()), 1000)
    const polling = setInterval(carregar, 5000)
    return () => { ativo = false; clearInterval(timer); clearInterval(polling) }
  }, [id])

  if (erro) return <div className="app-frame"><div className="content">{erro}<button className="btn-block btn-primary" onClick={() => navigate('/historico')}>Ver pedidos</button></div></div>
  if (!pedido) return <div className="app-frame"><div className="content" style={{ textAlign: 'center', paddingTop: 50 }}>Carregando pedido...</div></div>

  const aguardando = pedido.status === 'AGUARDANDO_PAGAMENTO'
  const expiracao = pagamento?.expiraEm ? new Date(pagamento.expiraEm).getTime() : null
  const restante = expiracao ? Math.max(0, expiracao - agora) : null
  const expirado = aguardando && restante === 0
  const pago = pagamento?.status === 'APROVADO' || pedido.pagamentoStatus === 'APROVADO'
  const cancelado = pedido.status === 'CANCELADO'

  return (
    <div className="app-frame" style={{ justifyContent: 'center' }}>
      <div className="content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 14 }}>{cancelado ? '❌' : aguardando ? '💠' : '✅'}</div>
        <h2 style={{ margin: '0 0 6px' }}>{cancelado ? 'Pedido cancelado' : aguardando ? 'Aguardando pagamento' : 'Pedido enviado!'}</h2>
        <p style={{ color: '#8A867C', fontSize: 13.5, marginBottom: 6 }}>
          Pedido <span className="order-id">#{pedido.numero}</span>{cancelado ? ' foi cancelado.' : aguardando ? ' foi criado e está aguardando a confirmação do pagamento.' : ' recebido pelo estabelecimento.'}
        </p>
        <p style={{ color: '#8A867C', fontSize: 12.5, marginBottom: 20 }}>Total: R$ {Number(pedido.total).toFixed(2)}</p>

        {pedido.formaPagamento === 'PIX' && aguardando && !expirado && !pago && pagamento && (
          <div className="card" style={{ width: '100%', maxWidth: 380, marginBottom: 16 }}>
            <strong>Pagamento via Pix</strong>
            <p style={{ color: '#666', fontSize: 12.5, lineHeight: 1.45, margin: '8px 0' }}>
              Faça o pagamento em até <strong>10 minutos</strong>. Depois desse prazo, o pedido será cancelado automaticamente.
            </p>
            {restante !== null && <div style={{ fontSize: 28, fontWeight: 800, margin: '10px 0', color: restante <= 120000 ? '#b42318' : '#2E6B4F' }}>{formatarTempo(restante)}</div>}
            {pagamento.qrCodeBase64 && <img src={`data:image/png;base64,${pagamento.qrCodeBase64}`} alt="QR Code Pix" style={{ width: 240, height: 240, objectFit: 'contain', display: 'block', margin: '10px auto' }} />}
            {pagamento.copiaECola && <textarea readOnly value={pagamento.copiaECola} aria-label="Pix Copia e Cola" style={{ width: '100%', minHeight: 92, fontSize: 11, boxSizing: 'border-box' }} />}
            {pagamento.copiaECola && <button className="btn-block btn-primary" onClick={() => navigator.clipboard?.writeText(pagamento.copiaECola)}>Copiar Pix Copia e Cola</button>}
            <p style={{ color: '#8A867C', fontSize: 11.5, marginTop: 10 }}>A tela verifica automaticamente a confirmação do pagamento.</p>
          </div>
        )}

        {aguardando && (expirado || pagamento?.status === 'EXPIRADO') && (
          <div className="card" style={{ width: '100%', maxWidth: 380, marginBottom: 16, borderColor: '#d32f2f', background: '#fff5f5' }}>
            <strong style={{ color: '#b42318' }}>Prazo de pagamento encerrado</strong>
            <p style={{ color: '#666', fontSize: 12.5 }}>Não identificamos o pagamento dentro de 10 minutos. O pedido será/foi cancelado.</p>
          </div>
        )}

        {aguardando && pago && (
          <div className="card" style={{ width: '100%', maxWidth: 380, marginBottom: 16, borderColor: '#4d8b63', background: '#f3faf5' }}>
            <strong>Pagamento confirmado!</strong>
            <p style={{ color: '#666', fontSize: 12.5 }}>Seu pedido foi recebido e agora poderá seguir para produção.</p>
          </div>
        )}

        {pedido.formaPagamento === 'PIX' && pedido.status === 'RECEBIDO' && pagamento?.status === 'APROVADO' && (
          <div className="card" style={{ width: '100%', maxWidth: 380, marginBottom: 16 }}>
            <strong>Pagamento confirmado</strong>
            <p style={{ color: '#666', fontSize: 12.5, marginBottom: 0 }}>O estabelecimento recebeu a confirmação do Pix.</p>
          </div>
        )}

        <button className="btn-block btn-primary" onClick={() => navigate(`/pedido/${pedido.id}`)}>Acompanhar pedido</button>
      </div>
    </div>
  )
}
