import { useEffect, useState } from 'react'

const FAIXAS_PADRAO = [
  { id: 'padrao-1', faixa: 'Até 2 km', ateKm: 2, valor: 3.0, ordem: 1 },
  { id: 'padrao-2', faixa: 'De 2 a 5 km', ateKm: 5, valor: 6.0, ordem: 2 },
  { id: 'padrao-3', faixa: 'De 5 a 8 km', ateKm: 8, valor: 9.0, ordem: 3 },
  { id: 'padrao-4', faixa: 'De 8 a 12 km', ateKm: 12, valor: 12.0, ordem: 4 },
]

function enderecoFormatado(data) {
  if (data.enderecoRua) {
    return [
      data.enderecoNumero ? `${data.enderecoRua}, ${data.enderecoNumero}` : data.enderecoRua,
      data.enderecoBairro,
      data.enderecoCidade && data.enderecoEstado ? `${data.enderecoCidade} - ${data.enderecoEstado}` : data.enderecoCidade || data.enderecoEstado,
      data.enderecoCep,
    ].filter(Boolean).join(', ')
  }
  return data.endereco || 'Endereço ainda não configurado.'
}

export default function TaxasEntrega() {
  const [taxas, setTaxas] = useState(FAIXAS_PADRAO)
  const [endereco, setEndereco] = useState('')
  const [raioMax, setRaioMax] = useState(12)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    async function fetchTaxas() {
      try {
        setLoading(true)
        const response = await fetch('/api/taxas-entrega')
        if (!response.ok) throw new Error(`API retornou ${response.status}`)
        const data = await response.json()
        if (Array.isArray(data.taxas)) setTaxas(data.taxas.map((t) => ({ ...t, faixa: t.faixa || `Até ${t.ateKm} km` })))
        setEndereco(enderecoFormatado(data))
        if (data.raioMax !== undefined) setRaioMax(data.raioMax)
      } catch (err) {
        console.warn('Erro ao carregar taxas:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTaxas()
  }, [])

  const updateValor = (id, valor) => {
    setTaxas((prev) => prev.map((t) => (t.id === id ? { ...t, valor } : t)))
    setSavedSuccess(false)
  }

  const salvar = async () => {
    setSaving(true)
    setSavedSuccess(false)
    try {
      const response = await fetch('/api/taxas-entrega', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raioMax: Number(raioMax) || 0,
          taxas: taxas.map((t) => ({ id: t.id, ateKm: t.ateKm, ordem: t.ordem, valor: Number(t.valor) || 0 })),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.erro || data.message || 'Não foi possível salvar as taxas.')
      if (Array.isArray(data.taxas)) setTaxas(data.taxas.map((t) => ({ ...t, faixa: t.faixa || `Até ${t.ateKm} km` })))
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Carregando taxas de entrega...</div>

  return (
    <div>
      <div className="section-head">
        <div><h2>Taxas de entrega por distância</h2><div className="muted">Calculadas a partir da rota real entre estabelecimento e cliente</div></div>
        <button className="btn btn-primary" onClick={salvar} disabled={saving}>{saving ? 'Salvando...' : savedSuccess ? '✓ Salvo com sucesso' : 'Salvar alterações'}</button>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 18 }}>
        <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div className="field"><label>Endereço de origem</label><input value={endereco} readOnly /><div className="muted" style={{ marginTop: 6 }}>Para alterar o endereço, use <strong>Configurações</strong>. Assim existe uma única fonte de verdade para a origem das entregas.</div></div>
          <div className="field"><label>Raio máximo de entrega (km)</label><input type="number" min="0" step="0.1" value={raioMax} onChange={(e) => { setRaioMax(e.target.value); setSavedSuccess(false) }} /></div>
        </div>
      </div>

      <div className="card">
        <table className="data-table"><thead><tr><th>Faixa de distância</th><th>Valor da taxa</th></tr></thead><tbody>
          {taxas.map((t) => <tr key={t.id || t.faixa}><td style={{ fontWeight: 700 }}>{t.faixa}</td><td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="money">R$</span><input type="number" step="0.01" min="0" value={t.valor} onChange={(e) => updateValor(t.id, e.target.value)} style={{ width: 90, padding: '6px 9px', border: '1px solid var(--line)', borderRadius: 6 }} /></div></td></tr>)}
        </tbody></table>
      </div>
      <p style={{ fontSize: 12, color: '#8A867C', marginTop: 10 }}>A distância usada pelo backend é a rota rodoviária. Se a rota não puder ser calculada, o pedido não recebe uma distância fictícia.</p>
    </div>
  )
}
