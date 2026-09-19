import { useEffect, useState } from 'react'

const FAIXAS_PADRAO = [
  { id: 1, faixa: 'Até 2 km', valor: 3.0 },
  { id: 2, faixa: 'De 2 a 5 km', valor: 6.0 },
  { id: 3, faixa: 'De 5 a 8 km', valor: 9.0 },
  { id: 4, faixa: 'De 8 a 12 km', valor: 12.0 },
]

export default function TaxasEntrega() {
  const [taxas, setTaxas] = useState(FAIXAS_PADRAO)
  const [endereco, setEndereco] = useState('Av. Presidente Vargas, 450 – Votorantim/SP')
  const [raioMax, setRaioMax] = useState(12)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // 1. Carrega dados de configuração e taxas do backend
  useEffect(() => {
    async function fetchTaxas() {
      try {
        setLoading(true)
        const response = await fetch('/api/taxas-entrega')

        if (response.ok) {
          const data = await response.json()
          
          if (data.taxas && Array.isArray(data.taxas)) setTaxas(data.taxas)
          else if (Array.isArray(data)) setTaxas(data)

          if (data.endereco) setEndereco(data.endereco)
          if (data.raioMax !== undefined) setRaioMax(data.raioMax)
        } else {
          console.warn(`API /api/taxas-entrega retornou status ${response.status}. Usando valores padrão.`)
        }
      } catch (err) {
        console.warn('Erro de rede ou backend off-line ao buscar taxas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTaxas()
  }, [])

  // 2. Atualiza o valor de uma faixa específica no estado local
  const updateValor = (id, valorStr) => {
    setTaxas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, valor: valorStr } : t))
    )
    setSavedSuccess(false)
  }

  // 3. Salva todas as configurações no servidor (PUT /api/taxas-entrega)
  const salvar = async () => {
    setSaving(true)
    setSavedSuccess(false)

    const payload = {
      endereco,
      raioMax: parseFloat(raioMax) || 0,
      taxas: taxas.map((t) => ({
        ...t,
        valor: parseFloat(t.valor) || 0,
      })),
    }

    try {
      const response = await fetch('/api/taxas-entrega', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
      } else {
        alert('Não foi possível salvar no servidor. Alterações mantidas localmente.')
      }
    } catch (err) {
      console.error(err)
      alert('Erro de conexão ao salvar as taxas de entrega.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Carregando taxas de entrega...</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Taxas de entrega por distância</h2>
          <div className="muted">Calculada a partir do endereço cadastrado do estabelecimento</div>
        </div>
        <button className="btn btn-primary" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : savedSuccess ? '✓ Salvo com sucesso' : 'Salvar alterações'}
        </button>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 18 }}>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="field">
            <label>Endereço de origem (do estabelecimento)</label>
            <input
              value={endereco}
              onChange={(e) => {
                setEndereco(e.target.value)
                setSavedSuccess(false)
              }}
              placeholder="Rua, Número - Bairro, Cidade/UF"
            />
          </div>
          <div className="field">
            <label>Raio máximo de entrega (km)</label>
            <input
              type="number"
              value={raioMax}
              onChange={(e) => {
                setRaioMax(e.target.value)
                setSavedSuccess(false)
              }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Faixa de distância</th>
              <th>Valor da taxa</th>
            </tr>
          </thead>
          <tbody>
            {taxas.map((t) => (
              <tr key={t.id || t.faixa}>
                <td style={{ fontWeight: 700 }}>{t.faixa}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="money">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={t.valor}
                      onChange={(e) => updateValor(t.id, e.target.value)}
                      style={{
                        width: 90,
                        padding: '6px 9px',
                        border: '1px solid var(--line)',
                        borderRadius: 6,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12, color: '#8A867C', marginTop: 10 }}>
        Pedidos acima do raio máximo aparecem apenas como "retirada no local" para o cliente.
      </p>
    </div>
  )
}