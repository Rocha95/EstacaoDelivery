import { useEffect, useMemo, useState } from 'react'

export default function Relatorios() {
  const [periodo, setPeriodo] = useState('7dias')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 1. Busca os pedidos reais do banco de dados
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

  // 2. Processa as métricas e relatórios diretamente no frontend
  const reportData = useMemo(() => {
    const lista = Array.isArray(orders) ? orders : []
    
    // Total de Faturamento e Pedidos
    const faturamento = lista.reduce((sum, o) => sum + (Number(o?.total) || 0), 0)
    const totalPedidos = lista.length
    
    // Contagem de cancelamentos (pedidos com status 'CANCELADO')
    const cancelados = lista.filter((o) => o?.status === 'CANCELADO' || o?.status === 'CANCELADA')
    const cancelamentos = cancelados.length
    const taxaCancelamento = totalPedidos > 0 ? ((cancelamentos / totalPedidos) * 100).toFixed(1) + '%' : '0%'

    // Mapeamento dos itens mais vendidos
    const itemMap = {}
    lista.forEach((order) => {
      if (Array.isArray(order.itens)) {
        order.itens.forEach((item) => {
          const nome = typeof item === 'object' ? (item.nome || item.descricao) : item
          if (nome) {
            itemMap[nome] = (itemMap[nome] || 0) + (item.quantidade || 1)
          }
        })
      }
    })

    const maisVendidos = Object.entries(itemMap)
      .map(([nome, qtd]) => ({ nome, qtd }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5)

    // Agrupamento por dia (Seg, Ter, Qua...)
    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const vendasPorDiaMap = { Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0, Sáb: 0, Dom: 0 }

    lista.forEach((order) => {
      const dataCriacao = order.created_at || order.data
      if (dataCriacao) {
        const dateObj = new Date(dataCriacao)
        if (!isNaN(dateObj.getTime())) {
          const nomeDia = diasDaSemana[dateObj.getDay()]
          if (vendasPorDiaMap[nomeDia] !== undefined) {
            vendasPorDiaMap[nomeDia] += Number(order.total) || 0
          }
        }
      }
    })

    const vendasDia = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((dia) => ({
      dia,
      valor: vendasPorDiaMap[dia],
    }))

    return {
      faturamento,
      totalPedidos,
      cancelamentos,
      taxaCancelamento,
      tempoMedioEntrega: 35, // valor padrão ou calculado se houver horário de término
      vendasDia,
      maisVendidos,
    }
  }, [orders])

  const maxVenda = useMemo(() => {
    const maxVal = Math.max(...reportData.vendasDia.map((v) => v.valor))
    return maxVal > 0 ? maxVal : 1
  }, [reportData.vendasDia])

  const maxQtdItem = useMemo(() => {
    const maxVal = Math.max(...reportData.maisVendidos.map((v) => v.qtd))
    return maxVal > 0 ? maxVal : 1
  }, [reportData.maisVendidos])

  if (loading) return <div className="loading">Carregando relatório...</div>
  if (error) return <div className="error-message">Erro: {error}</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Relatórios</h2>
          <div className="muted">Desempenho de vendas e operação</div>
        </div>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13 }}
        >
          <option value="7dias">Últimos 7 dias</option>
          <option value="30dias">Últimos 30 dias</option>
          <option value="mes">Este mês</option>
        </select>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="label">Faturamento no período</div>
          <div className="value">R$ {reportData.faturamento.toFixed(2)}</div>
          <div className="delta delta-up">no período</div>
        </div>
        <div className="card stat-card">
          <div className="label">Pedidos no período</div>
          <div className="value">{reportData.totalPedidos}</div>
          <div className="delta delta-up">total registrados</div>
        </div>
        <div className="card stat-card">
          <div className="label">Cancelamentos</div>
          <div className="value">{reportData.cancelamentos}</div>
          <div className="delta delta-down">{reportData.taxaCancelamento} dos pedidos</div>
        </div>
        <div className="card stat-card">
          <div className="label">Tempo médio de entrega</div>
          <div className="value">{reportData.tempoMedioEntrega} min</div>
          <div className="delta" style={{ color: '#8A867C' }}>estável</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        {/* Gráfico de Faturamento por Dia */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-head" style={{ marginBottom: 18 }}>
            <h2>Faturamento por dia</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 180 }}>
            {reportData.vendasDia.map((v) => {
              const heightPx = Math.round((v.valor / maxVenda) * 140)
              return (
                <div key={v.dia} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 34,
                      height: `${heightPx}px`,
                      background: 'var(--chili)',
                      borderRadius: '4px 4px 0 0',
                    }}
                    title={`R$ ${v.valor.toFixed(2)}`}
                  />
                  <span style={{ fontSize: 11.5, color: '#8A867C', fontWeight: 700 }}>{v.dia}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lista de Mais Vendidos */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-head" style={{ marginBottom: 18 }}>
            <h2>Mais vendidos</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reportData.maisVendidos.map((p) => {
              const widthPct = Math.round((p.qtd / maxQtdItem) * 100)
              return (
                <div key={p.nome}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                    <span>{p.nome}</span>
                    <span className="money">{p.qtd}</span>
                  </div>
                  <div style={{ background: 'var(--line-soft)', borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${widthPct}%`, background: 'var(--mustard)', height: 6, borderRadius: 4 }} />
                  </div>
                </div>
              )
            })}
            {reportData.maisVendidos.length === 0 && (
              <div className="empty-state">Nenhum item vendido ainda.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}