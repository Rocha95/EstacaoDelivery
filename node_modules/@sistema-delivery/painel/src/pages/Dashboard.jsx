import { useEffect, useMemo, useState } from 'react'

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

const COLUMNS = [STATUS.RECEBIDO, STATUS.EM_PRODUCAO, STATUS.SAIU_PARA_ENTREGA, STATUS.FINALIZADO]

const NEXT_STATUS = {
  [STATUS.RECEBIDO]: STATUS.EM_PRODUCAO,
  [STATUS.EM_PRODUCAO]: STATUS.SAIU_PARA_ENTREGA,
  [STATUS.SAIU_PARA_ENTREGA]: STATUS.FINALIZADO,
}

const NEXT_LABEL = {
  [STATUS.RECEBIDO]: 'Iniciar produção',
  [STATUS.EM_PRODUCAO]: 'Saiu para entrega',
  [STATUS.SAIU_PARA_ENTREGA]: 'Marcar finalizado',
}

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const response = await fetch('/api/pedidos')
        if (!response.ok) throw new Error('Erro ao carregar pedidos')
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

  const advance = async (id, currentStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus]
    if (!nextStatus) return

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
    )

    try {
      const response = await fetch(`/api/pedidos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!response.ok) {
        throw new Error('Falha ao atualizar no banco')
      }
    } catch (err) {
      alert('Não foi possível atualizar o pedido. Tente novamente.')
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: currentStatus } : o))
      )
    }
  }

  const stats = useMemo(() => {
    const lista = Array.isArray(orders) ? orders : []
    const faturamento = lista.reduce((sum, o) => sum + (Number(o?.total) || 0), 0)
    const emAndamento = lista.filter((o) => o?.status !== STATUS.FINALIZADO).length
    const ticketMedio = lista.length > 0 ? faturamento / lista.length : 0

    return { total: lista.length, faturamento, emAndamento, ticketMedio }
  }, [orders])

  if (loading) return <div className="loading">Carregando pedidos...</div>
  if (error) return <div className="error-message">Erro: {error}</div>

  return (
    <div>
      <div className="stat-grid">
        <div className="card stat-card">
          <div className="label">Pedidos hoje</div>
          <div className="value">{stats.total}</div>
          <div className="delta delta-up">+18% vs. ontem</div>
        </div>
        <div className="card stat-card">
          <div className="label">Faturamento hoje</div>
          <div className="value">R$ {Number(stats.faturamento || 0).toFixed(2)}</div>
          <div className="delta delta-up">+9% vs. ontem</div>
        </div>
        <div className="card stat-card">
          <div className="label">Em andamento</div>
          <div className="value">{stats.emAndamento}</div>
          <div className="delta" style={{ color: '#8A867C' }}>na fila agora</div>
        </div>
        <div className="card stat-card">
          <div className="label">Ticket médio</div>
          <div className="value">R$ {Number(stats.ticketMedio || 0).toFixed(2)}</div>
          <div className="delta delta-down">-3% vs. ontem</div>
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2>Linha de expedição</h2>
          <div className="muted">Avance o pedido para a próxima estação conforme ele avança</div>
        </div>
      </div>

      <div className="rail">
        {COLUMNS.map((status) => {
          const items = (Array.isArray(orders) ? orders : []).filter((o) => o?.status === status)
          return (
            <div className="rail-col" key={status}>
              <div className="rail-col-head">
                <span>{STATUS_LABEL[status]}</span>
                <span className="pill pill-muted">{items.length}</span>
              </div>
              <div className="rail-col-body">
                {items.length === 0 && <div className="empty-state">Nenhum pedido aqui</div>}
                {items.map((o) => (
                  <div className="ticket" key={o.id}>
                    <div className="top-row">
                      <span className="order-id">#{o.id}</span>
                      <span className="pill pill-muted">{o.tipo === 'delivery' ? 'Delivery' : 'Retirada'}</span>
                    </div>

                    {/* Exibição tratada do nome do cliente */}
                    <div>{typeof o.cliente === 'object' ? o.cliente?.nome : o.cliente}</div>

                    {/* Exibição tratada da lista de itens */}
                    <div className="items">
                      {Array.isArray(o.itens)
                        ? o.itens.map(item => (typeof item === 'object' ? item.nome || item.descricao : item)).join(' · ')
                        : (o.itens || '')}
                    </div>

                    <div className="foot">
                      <span className="money">R$ {Number(o.total || 0).toFixed(2)}</span>
                      {NEXT_STATUS[status] && (
                        <button onClick={() => advance(o.id, o.status)}>
                          {NEXT_LABEL[status]}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}