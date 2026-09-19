import { useEffect, useState } from 'react'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)

  // 1. Carrega os clientes do backend via API REST com suporte a busca (query param)
  useEffect(() => {
    let active = true
    const timeoutId = setTimeout(() => {
      async function fetchClientes() {
        try {
          setLoading(true)
          const query = busca.trim() ? `?busca=${encodeURIComponent(busca.trim())}` : ''
          const response = await fetch(`/api/clientes${query}`)

          if (!active) return

          if (response.ok) {
            const data = await response.json()
            setClientes(Array.isArray(data) ? data : [])
          } else {
            console.warn(`API /api/clientes retornou status ${response.status}. Usando lista vazia.`)
            setClientes([])
          }
        } catch (err) {
          if (!active) return
          console.warn('Erro de rede ou backend off-line ao buscar clientes:', err)
          setClientes([])
        } finally {
          if (active) setLoading(false)
        }
      }

      fetchClientes()
    }, 300) // Debounce de 300ms para requisições de busca

    return () => {
      active = false
      clearTimeout(timeoutId)
    }
  }, [busca])

  // Helper para formatar datas com segurança
  const formatarData = (dataStr) => {
    if (!dataStr) return '-'
    if (dataStr.includes('-')) {
      return dataStr.split('T')[0].split('-').reverse().join('/')
    }
    return dataStr
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Clientes</h2>
          <div className="muted">Histórico de quem já pediu no seu estabelecimento</div>
        </div>
        <input
          placeholder="Buscar cliente por nome ou telefone..."
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

      <div className="card">
        {loading ? (
          <div className="loading" style={{ padding: 24, textAlign: 'center' }}>
            Carregando clientes...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Pedidos</th>
                <th>Último pedido</th>
                <th>Total gasto</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c, index) => {
                const totalGasto = Number(c.gasto ?? c.totalGasto ?? 0)
                const qtdPedidos = c.pedidos ?? c.totalPedidos ?? 0
                const ultimoPedidoData = c.ultimoPedido || c.ultimo_pedido

                return (
                  <tr key={c.id || index}>
                    <td style={{ fontWeight: 700 }}>{c.nome || 'Cliente sem nome'}</td>
                    <td>{c.telefone || '-'}</td>
                    <td>{qtdPedidos}</td>
                    <td>{formatarData(ultimoPedidoData)}</td>
                    <td className="money">R$ {totalGasto.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {!loading && clientes.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <div className="empty-state">
              {busca.trim()
                ? `Nenhum cliente encontrado para "${busca}".`
                : 'Nenhum cliente cadastrado no banco de dados.'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}