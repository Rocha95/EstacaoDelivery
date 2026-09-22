import { useEffect, useMemo, useState } from 'react'

const STATUS = {
  AGUARDANDO_PAGAMENTO: 'AGUARDANDO_PAGAMENTO',
  RECEBIDO: 'RECEBIDO',
  EM_PRODUCAO: 'EM_PRODUCAO',
  SAIU_PARA_ENTREGA: 'SAIU_PARA_ENTREGA',
  FINALIZADO: 'FINALIZADO',
}

const STATUS_LABEL = {
  [STATUS.AGUARDANDO_PAGAMENTO]: 'Aguardando pagamento',
  [STATUS.RECEBIDO]: 'Recebido',
  [STATUS.EM_PRODUCAO]: 'Em Produção',
  [STATUS.SAIU_PARA_ENTREGA]: 'Saiu para Entrega',
  [STATUS.FINALIZADO]: 'Finalizado',
}

const COLUMNS = [STATUS.AGUARDANDO_PAGAMENTO, STATUS.RECEBIDO, STATUS.EM_PRODUCAO, STATUS.SAIU_PARA_ENTREGA, STATUS.FINALIZADO]

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

function mensagemDaResposta(data, status) {
  return data?.erro || data?.message || data?.error || `Não foi possível atualizar o pedido (HTTP ${status}).`
}

function isAgendadoFuturo(pedido) {
  return Boolean(pedido?.agendadoPara && new Date(pedido.agendadoPara).getTime() > Date.now())
}

function textoAgendamento(pedido) {
  if (!pedido?.agendadoPara) return ''
  return new Date(pedido.agendadoPara).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aviso, setAviso] = useState('')
  const [avisoTipo, setAvisoTipo] = useState('warning')
  const [atualizando, setAtualizando] = useState(null)

  async function carregarPedidos() {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/pedidos')
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(mensagemDaResposta(data, response.status))
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
      setError(err.message || 'Não foi possível carregar os pedidos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarPedidos()
  }, [])

  const advance = async (pedido) => {
    const id = pedido?.id
    const currentStatus = pedido?.status
    const nextStatus = NEXT_STATUS[currentStatus]
    if (!id || !nextStatus || atualizando) return

    setAviso('')

    if (isAgendadoFuturo(pedido)) {
      setAvisoTipo('warning')
      setAviso(`Este pedido está agendado para ${textoAgendamento(pedido)}. A produção só poderá ser iniciada a partir do horário agendado.`)
      return
    }

    setAtualizando(id)
    try {
      const response = await fetch(`/api/pedidos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const mensagem = mensagemDaResposta(data, response.status)
        setAvisoTipo(response.status === 409 ? 'warning' : 'error')
        setAviso(mensagem)
        return
      }

      // Recarrega do banco em vez de manter um estado otimista que poderia
      // ficar diferente da realidade caso outra regra bloqueie a operação.
      await carregarPedidos()
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      setAvisoTipo('error')
      setAviso(err.message || 'Não foi possível atualizar o pedido. Verifique a conexão e tente novamente.')
    } finally {
      setAtualizando(null)
    }
  }

  async function confirmarPagamentoManual(pedido) {
    if (!pedido?.id || atualizando) return
    setAviso('')
    setAtualizando(pedido.id)
    try {
      const response = await fetch(`/api/pagamentos/${pedido.id}/confirmar-manual`, { method: 'PATCH' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setAvisoTipo(response.status === 409 ? 'warning' : 'error')
        setAviso(data?.erro || data?.message || `Não foi possível confirmar o pagamento (HTTP ${response.status}).`)
        return
      }
      await carregarPedidos()
    } catch (err) {
      setAvisoTipo('error')
      setAviso(err.message || 'Não foi possível confirmar o pagamento.')
    } finally {
      setAtualizando(null)
    }
  }

  const stats = useMemo(() => {
    const lista = Array.isArray(orders) ? orders : []
    const faturamento = lista.reduce((sum, o) => sum + (Number(o?.total) || 0), 0)
    const emAndamento = lista.filter((o) => !['FINALIZADO', 'CANCELADO'].includes(o?.status)).length
    const aguardandoPagamento = lista.filter((o) => o?.status === STATUS.AGUARDANDO_PAGAMENTO).length
    const ticketMedio = lista.length > 0 ? faturamento / lista.length : 0
    return { total: lista.length, faturamento, emAndamento, aguardandoPagamento, ticketMedio }
  }, [orders])

  if (loading) return <div className="loading">Carregando pedidos...</div>
  if (error) {
    return <div className="card" style={{ padding: 20, borderColor: '#d32f2f' }}>
      <strong>Não foi possível carregar os pedidos.</strong>
      <div className="muted" style={{ marginTop: 6 }}>{error}</div>
      <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={carregarPedidos}>Tentar novamente</button>
    </div>
  }

  return (
    <div>
      <div className="stat-grid">
        <div className="card stat-card"><div className="label">Pedidos hoje</div><div className="value">{stats.total}</div><div className="delta delta-up">operando agora</div></div>
        <div className="card stat-card"><div className="label">Faturamento hoje</div><div className="value">R$ {Number(stats.faturamento || 0).toFixed(2)}</div><div className="delta delta-up">pedidos carregados</div></div>
        <div className="card stat-card"><div className="label">Aguardando pagamento</div><div className="value">{stats.aguardandoPagamento}</div><div className="delta" style={{ color: '#8A867C' }}>Pix pendente</div></div>
        <div className="card stat-card"><div className="label">Em andamento</div><div className="value">{stats.emAndamento}</div><div className="delta" style={{ color: '#8A867C' }}>na fila agora</div></div>
        <div className="card stat-card"><div className="label">Ticket médio</div><div className="value">R$ {Number(stats.ticketMedio || 0).toFixed(2)}</div><div className="delta" style={{ color: '#8A867C' }}>média dos pedidos</div></div>
      </div>

      <div className="section-head">
        <div><h2>Linha de expedição</h2><div className="muted">Avance o pedido para a próxima estação conforme ele avança</div></div>
      </div>

      {aviso && (
        <div className="card" role="alert" style={{ marginBottom: 16, borderColor: avisoTipo === 'error' ? '#d32f2f' : '#d9a441', background: avisoTipo === 'error' ? '#fff2f2' : '#fff8e7' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{avisoTipo === 'error' ? '⚠️' : '⏰'}</span>
            <div style={{ flex: 1 }}>
              <strong style={{ color: avisoTipo === 'error' ? '#a52828' : '#76530b' }}>{avisoTipo === 'error' ? 'Não foi possível atualizar o pedido' : 'Atenção ao pedido'}</strong>
              <div style={{ marginTop: 4, color: avisoTipo === 'error' ? '#7f2020' : '#76530b' }}>{aviso}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setAviso('')}>Fechar</button>
          </div>
        </div>
      )}

      <div className="rail">
        {COLUMNS.map((status) => {
          const items = orders.filter((o) => o?.status === status)
          return (
            <div className="rail-col" key={status}>
              <div className="rail-col-head"><span>{STATUS_LABEL[status]}</span><span className="pill pill-muted">{items.length}</span></div>
              <div className="rail-col-body">
                {items.length === 0 && <div className="empty-state">Nenhum pedido aqui</div>}
                {items.map((o) => {
                  const aguardandoPagamento = o.status === STATUS.AGUARDANDO_PAGAMENTO
                  const agendado = isAgendadoFuturo(o)
                  const bloqueado = agendado || atualizando === o.id
                  return (
                    <div className="ticket" key={o.id}>
                      <div className="top-row">
                        <span className="order-id">#{o.numero || String(o.id).slice(-6)}</span>
                        <span className="pill pill-muted">{o.tipoEntrega === 'DELIVERY' ? 'Delivery' : o.tipoEntrega === 'RETIRADA' ? 'Retirada no local' : 'Não informado'}</span>
                      </div>
                      <div>{typeof o.cliente === 'object' ? o.cliente?.nome : o.cliente}</div>
                      <div className="items">{Array.isArray(o.itens) ? o.itens.map(item => (typeof item === 'object' ? `${item.quantidade || 1}x ${item.nome || item.descricao || 'Item'}` : item)).join(' · ') : (o.itens || '')}</div>
                      {agendado && <div style={{ color: '#8a6500', fontSize: 11, marginTop: 6 }}>⏰ Agendado para {textoAgendamento(o)}</div>}
                      {aguardandoPagamento && o.pagamento?.expiraEm && <div style={{ color: '#8a6500', fontSize: 11, marginTop: 6 }}>💠 Pagamento até {new Date(o.pagamento.expiraEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</div>}
                      <div className="foot">
                        <span className="money">R$ {Number(o.total || 0).toFixed(2)}</span>
                        {aguardandoPagamento ? (
                          o.pagamento?.provedor === 'MANUAL' ? (
                            <button disabled={atualizando === o.id} onClick={() => confirmarPagamentoManual(o)}>
                              {atualizando === o.id ? 'Confirmando...' : 'Confirmar pagamento'}
                            </button>
                          ) : (
                            <span style={{ color: '#8A867C', fontSize: 11 }}>Aguardando Pix</span>
                          )
                        ) : NEXT_STATUS[status] && (
                          <button disabled={bloqueado} onClick={() => advance(o)} title={agendado ? `Produção liberada a partir de ${textoAgendamento(o)}` : undefined}>
                            {atualizando === o.id ? 'Atualizando...' : agendado ? 'Aguardando horário' : NEXT_LABEL[status]}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
