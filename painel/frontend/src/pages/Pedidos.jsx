import { useCallback, useEffect, useMemo, useState } from 'react'
import StatusPill from '../components/StatusPill'

const STATUS = {
  AGUARDANDO_PAGAMENTO: 'AGUARDANDO_PAGAMENTO',
  RECEBIDO: 'RECEBIDO',
  EM_PRODUCAO: 'EM_PRODUCAO',
  SAIU_PARA_ENTREGA: 'SAIU_PARA_ENTREGA',
  FINALIZADO: 'FINALIZADO',
  CANCELADO: 'CANCELADO',
}

const STATUS_LABEL = {
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  RECEBIDO: 'Recebido',
  EM_PRODUCAO: 'Em produção',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
}

const FILTERS = [
  { key: 'todos', label: 'Todos' },
  ...Object.values(STATUS).map((key) => ({ key, label: STATUS_LABEL[key] })),
]

const NEXT_STATUS = {
  RECEBIDO: STATUS.EM_PRODUCAO,
  EM_PRODUCAO: STATUS.SAIU_PARA_ENTREGA,
  SAIU_PARA_ENTREGA: STATUS.FINALIZADO,
}

const NEXT_LABEL = {
  RECEBIDO: 'Iniciar produção',
  EM_PRODUCAO: 'Saiu para entrega',
  SAIU_PARA_ENTREGA: 'Finalizar pedido',
}

const TIPO_ENTREGA_LABEL = {
  DELIVERY: 'Delivery',
  RETIRADA: 'Retirada no local',
}

const PAGAMENTO_LABEL = {
  PIX: 'Pix',
  DINHEIRO_ENTREGA: 'Dinheiro na entrega',
  CARTAO_ENTREGA: 'Cartão na entrega',
}

function formatCliente(cliente) {
  return typeof cliente === 'object' && cliente !== null
    ? cliente.nome || 'Cliente sem nome'
    : cliente || 'Cliente não identificado'
}

function formatItens(itens) {
  if (!Array.isArray(itens)) return ''
  return itens.map((item) => {
    if (!item || typeof item !== 'object') return String(item || '')
    return `${item.quantidade || 1}x ${item.nome || 'Item'}`
  }).join(', ')
}

export default function Pedidos() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('todos')
  const [busca, setBusca] = useState('')
  const [atualizando, setAtualizando] = useState(null)
  const [aviso, setAviso] = useState('')

  const carregar = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/pedidos')
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.erro || data?.message || data?.error || `Não foi possível carregar os pedidos (HTTP ${response.status}).`)
      }
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
      setError(err.message || 'Não foi possível carregar os pedidos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const advance = async (pedido, nextStatus) => {
    if (!pedido?.id || !nextStatus || atualizando) return
    setAviso('')
    if (pedido.agendadoPara && new Date(pedido.agendadoPara).getTime() > Date.now()) {
      const quando = new Date(pedido.agendadoPara).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
      setAviso(`Este pedido está agendado para ${quando}. A produção só poderá ser iniciada a partir do horário agendado.`)
      return
    }
    setAtualizando(pedido.id)
    try {
      const response = await fetch(`/api/pedidos/${pedido.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const mensagem = data?.erro || data?.message || data?.error || `Não foi possível atualizar o pedido (HTTP ${response.status}).`
        if (data?.codigo === 'PEDIDO_AGENDADO' || /agendado/i.test(mensagem)) setAviso(mensagem)
        throw new Error(mensagem)
      }
      await carregar()
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      setAviso(err.message || 'Não foi possível atualizar o pedido.')
    } finally {
      setAtualizando(null)
    }
  }

  const confirmarPagamentoManual = async (pedido) => {
    if (!pedido?.id || atualizando) return
    setAviso('')
    setAtualizando(pedido.id)
    try {
      const response = await fetch(`/api/pagamentos/${pedido.id}/confirmar-manual`, { method: 'PATCH' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.erro || data?.message || `Não foi possível confirmar o pagamento (HTTP ${response.status}).`)
      await carregar()
    } catch (err) {
      setAviso(err.message || 'Não foi possível confirmar o pagamento.')
    } finally {
      setAtualizando(null)
    }
  }

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return orders.filter((pedido) => {
      const passaStatus = filter === 'todos' || pedido.status === filter
      const cliente = formatCliente(pedido.cliente).toLowerCase()
      const numero = String(pedido.numero || '').toLowerCase()
      return passaStatus && (!termo || cliente.includes(termo) || numero.includes(termo))
    })
  }, [orders, filter, busca])

  if (loading) return <div className="loading">Carregando pedidos...</div>

  if (error) {
    return (
      <div>
        <div className="section-head">
          <div>
            <h2>Pedidos</h2>
            <div className="muted">Acompanhe os pedidos recebidos pela loja</div>
          </div>
        </div>
        <div className="card" style={{ borderColor: '#d32f2f' }}>
          <strong>Não foi possível carregar os pedidos.</strong>
          <div className="muted" style={{ marginTop: 6 }}>{error}</div>
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={carregar}>Tentar novamente</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Pedidos</h2>
          <div className="muted">{visiveis.length} pedido(s) encontrados</div>
        </div>
        <input
          className="field"
          placeholder="Buscar por cliente ou número do pedido"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, minWidth: 280 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map((item) => (
          <button key={item.key} className={filter === item.key ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} onClick={() => setFilter(item.key)}>
            {item.label}
          </button>
        ))}
      </div>

      {aviso && (
        <div className="card" role="alert" style={{ marginBottom: 16, borderColor: '#d9a441', background: '#fff8e7' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⏰</span>
            <div>
              <strong style={{ color: '#76530b' }}>Pedido agendado</strong>
              <div style={{ marginTop: 4, color: '#76530b' }}>{aviso}</div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setAviso('')}>Fechar</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Recebimento</th>
              <th>Itens</th>
              <th>Pagamento</th>
              <th>Total</th>
              <th>Status</th>
              <th>Horário</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((pedido) => {
              const next = NEXT_STATUS[pedido.status]
              return (
                <tr key={pedido.id}>
                  <td className="order-id">#{pedido.numero || String(pedido.id).slice(-6)}</td>
                  <td>{formatCliente(pedido.cliente)}</td>
                  <td>{TIPO_ENTREGA_LABEL[pedido.tipoEntrega] || pedido.tipoEntrega || 'Não informado'}</td>
                  <td style={{ color: '#6B675F', maxWidth: 260 }}>{formatItens(pedido.itens)}</td>
                  <td>{PAGAMENTO_LABEL[pedido.formaPagamento] || pedido.formaPagamento || 'Não informado'}</td>
                  <td className="money">R$ {Number(pedido.total || 0).toFixed(2)}</td>
                  <td><StatusPill status={pedido.status} /></td>
                  <td>{pedido.agendadoPara ? `Agendado: ${new Date(pedido.agendadoPara).toLocaleString('pt-BR')}` : new Date(pedido.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    {pedido.status === 'AGUARDANDO_PAGAMENTO' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {pedido.pagamento?.expiraEm && <span style={{ color: '#8a6500', fontSize: 11 }}>Pagamento até {new Date(pedido.pagamento.expiraEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>}
                        {pedido.pagamento?.provedor === 'MANUAL' ? (
                          <button className="btn btn-primary btn-sm" disabled={atualizando === pedido.id} onClick={() => confirmarPagamentoManual(pedido)}>
                            {atualizando === pedido.id ? 'Confirmando...' : 'Confirmar pagamento'}
                          </button>
                        ) : (
                          <span style={{ color: '#8A867C', fontSize: 12 }}>Aguardando confirmação do Pix</span>
                        )}
                      </div>
                    ) : next ? (() => {
                      const agendado = pedido.agendadoPara && new Date(pedido.agendadoPara).getTime() > Date.now()
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <button className="btn btn-ghost btn-sm" disabled={atualizando === pedido.id || agendado} onClick={() => advance(pedido, next)} title={agendado ? 'A produção só poderá ser iniciada no horário agendado.' : undefined}>
                            {atualizando === pedido.id ? 'Atualizando...' : agendado ? 'Aguardando horário' : NEXT_LABEL[pedido.status]}
                          </button>
                          {agendado && <span style={{ color: '#8a6500', fontSize: 11 }}>Agendado para {new Date(pedido.agendadoPara).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>}
                        </div>
                      )
                    })() : <span style={{ color: '#8A867C', fontSize: 12 }}>Concluído</span>}
                  </td>
                </tr>
              )
            })}
            {!visiveis.length && (
              <tr><td colSpan={9}><div className="empty-state">Nenhum pedido encontrado com esses filtros.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
