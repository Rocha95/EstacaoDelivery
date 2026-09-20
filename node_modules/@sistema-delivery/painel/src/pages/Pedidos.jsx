import { useEffect, useMemo, useState } from 'react'
import StatusPill from '../components/StatusPill'

const STATUS = {
  RECEBIDO: 'RECEBIDO',
  EM_PRODUCAO: 'EM_PRODUCAO',
  SAIU_PARA_ENTREGA: 'SAIU_PARA_ENTREGA',
  FINALIZADO: 'FINALIZADO',
}

const STATUS_LABEL = {
  [STATUS.RECEBIDO]: 'Recebido',
  [STATUS.EM_PRODUCAO]: 'Em Produção',
  [STATUS.SAIU_PARA_ENTREGA]: 'Saiu para Entrega',
  [STATUS.FINALIZADO]: 'Finalizado',
}

const FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: STATUS.RECEBIDO, label: STATUS_LABEL[STATUS.RECEBIDO] },
  { key: STATUS.EM_PRODUCAO, label: STATUS_LABEL[STATUS.EM_PRODUCAO] },
  { key: STATUS.SAIU_PARA_ENTREGA, label: STATUS_LABEL[STATUS.SAIU_PARA_ENTREGA] },
  { key: STATUS.FINALIZADO, label: STATUS_LABEL[STATUS.FINALIZADO] },
]

const NEXT_STATUS = {
  [STATUS.RECEBIDO]: STATUS.EM_PRODUCAO,
  [STATUS.EM_PRODUCAO]: STATUS.SAIU_PARA_ENTREGA,
  [STATUS.SAIU_PARA_ENTREGA]: STATUS.FINALIZADO,
}

const NEXT_LABEL = {
  [STATUS.RECEBIDO]: 'Iniciar produção',
  [STATUS.EM_PRODUCAO]: 'Saiu p/ entrega',
  [STATUS.SAIU_PARA_ENTREGA]: 'Finalizar',
}

export default function Pedidos() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('todos')
  const [busca, setBusca] = useState('')

  // 1. Busca os pedidos do banco ao carregar
  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/pedidos')
        if (!response.ok) throw new Error('Erro ao carregar lista de pedidos')
        const data = await response.json()
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // 2. Atualização otimista + PATCH/PUT com tratamento do erro 404
  const advance = async (id, currentStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus]
    if (!nextStatus) return

    // Atualização otimista na interface
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
    )

    try {
      // Tenta rota RESTful padrão: PATCH /api/pedidos/:id
      let response = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      // Se der 404, tenta o endpoint secundário: PATCH /api/pedidos/:id/status
      if (response.status === 404) {
        response = await fetch(`/api/pedidos/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        })
      }

      // Se ainda der 404, tenta com método PUT no endpoint principal
      if (response.status === 404) {
        response = await fetch(`/api/pedidos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        })
      }

      if (!response.ok) {
        throw new Error(`Falha ao atualizar pedido (HTTP ${response.status})`)
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      alert('Não foi possível atualizar o pedido. Tente novamente.')

      // Reverte o estado em caso de falha na comunicação
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: currentStatus } : o))
      )
    }
  }

  // Helpers de formatação segura
  const getClienteNome = (cliente) => {
    if (typeof cliente === 'object' && cliente !== null) {
      return cliente.nome || 'Cliente sem nome'
    }
    return cliente || 'Cliente não identificado'
  }

  const formatItens = (itens) => {
    if (Array.isArray(itens)) {
      return itens
        .map((item) =>
          typeof item === 'object' && item !== null
            ? item.nome || item.descricao || 'Item'
            : item
        )
        .join(', ')
    }
    return itens || ''
  }

  // 3. Filtragem e busca reativas
  const visiveis = useMemo(() => {
    const lista = Array.isArray(orders) ? orders : []
    const termo = busca.trim().toLowerCase()

    return lista.filter((o) => {
      const passaFiltro = filter === 'todos' || o?.status === filter

      const nomeCliente = getClienteNome(o?.cliente).toLowerCase()
      const orderId = String(o?.id || '').toLowerCase()

      const passaBusca =
        termo === '' ||
        nomeCliente.includes(termo) ||
        orderId.includes(termo)

      return passaFiltro && passaBusca
    })
  }, [orders, filter, busca])

  if (loading) return <div className="loading">Carregando pedidos...</div>
  if (error) return <div className="error-message">Erro: {error}</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Todos os pedidos</h2>
          <div className="muted">{visiveis.length} pedido(s) encontrados</div>
        </div>
        <input
          className="field"
          placeholder="Buscar por cliente ou nº do pedido"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            padding: '9px 12px',
            border: '1px solid var(--line)',
            borderRadius: 6,
            fontSize: 13,
            minWidth: 260,
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={filter === f.key ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Itens</th>
              <th>Pagamento</th>
              <th>Total</th>
              <th>Status</th>
              <th>Horário</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((o) => (
              <tr key={o.id}>
                <td className="order-id">#{o.numero || String(o.id).slice(-6)}</td>
                <td>{getClienteNome(o.cliente)}</td>
                <td>{o.tipo === 'delivery' ? 'Delivery' : 'Retirada'}</td>
                <td style={{ color: '#6B675F', maxWidth: 220 }}>{formatItens(o.itens)}</td>
                <td>{o.pagamento || 'N/A'}</td>
                <td className="money">R$ {Number(o.total || 0).toFixed(2)}</td>
                <td><StatusPill status={o.status} /></td>
                <td>{o.agendadoPara ? `Agendado: ${new Date(o.agendadoPara).toLocaleString('pt-BR')}` : (o.hora || o.created_at || '--:--')}</td>
                <td>
                  {NEXT_STATUS[o.status] ? (
                    <button className="btn btn-ghost btn-sm" onClick={() => advance(o.id, o.status)}>
                      {NEXT_LABEL[o.status]}
                    </button>
                  ) : (
                    <span style={{ color: '#8A867C', fontSize: 12 }}>Concluído</span>
                  )}
                </td>
              </tr>
            ))}
            {visiveis.length === 0 && (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">Nenhum pedido encontrado com esses filtros.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}