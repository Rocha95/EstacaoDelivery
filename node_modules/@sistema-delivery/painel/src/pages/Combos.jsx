import { useEffect, useState } from 'react'

export default function Combos() {
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [novo, setNovo] = useState({
    nome: '',
    itensText: '',
    preco: '',
    economiza: '',
  })

  // 1. Carrega os combos do banco com fallback resiliente
  useEffect(() => {
    async function fetchCombos() {
      try {
        setLoading(true)
        const response = await fetch('/api/combos')

        if (response.ok) {
          const data = await response.json()
          setCombos(Array.isArray(data) ? data : [])
        } else {
          console.warn(`API /api/combos retornou status ${response.status}. Usando lista vazia.`)
          setCombos([])
        }
      } catch (err) {
        console.warn('Erro de rede ou backend off-line ao buscar combos:', err)
        setCombos([])
      } finally {
        setLoading(false)
      }
    }

    fetchCombos()
  }, [])

  // 2. Alterna o status ativo/inativo (PATCH com atualização otimista)
  const toggleAtivo = async (id, statusAtual) => {
    const novoStatus = !statusAtual

    // Atualização otimista
    setCombos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ativo: novoStatus } : c))
    )

    try {
      const response = await fetch(`/api/combos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: novoStatus }),
      })

      if (!response.ok) {
        throw new Error('Falha ao atualizar o status do combo no servidor')
      }
    } catch (err) {
      console.error(err)
      // Reverte em caso de erro no servidor
      setCombos((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ativo: statusAtual } : c))
      )
    }
  }

  // 3. Cadastra um novo combo (POST /api/combos)
  const salvar = async (e) => {
    e.preventDefault()
    if (!novo.nome.trim() || !novo.preco) return

    setSubmitting(true)

    const arrayItens = novo.itensText
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean)

    const payload = {
      nome: novo.nome.trim(),
      itens: arrayItens,
      preco: parseFloat(novo.preco) || 0,
      economiza: parseFloat(novo.economiza) || 0,
      ativo: true,
    }

    try {
      const response = await fetch('/api/combos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const comboCriado = await response.json()
        setCombos((prev) => [...prev, comboCriado])
      } else {
        // Fallback local caso o backend responda com erro
        setCombos((prev) => [...prev, { ...payload, id: Date.now() }])
      }

      setNovo({ nome: '', itensText: '', preco: '', economiza: '' })
      setShowForm(false)
    } catch (err) {
      console.warn('Backend off-line. Adicionando combo apenas no estado local.')
      setCombos((prev) => [...prev, { ...payload, id: Date.now() }])
      setNovo({ nome: '', itensText: '', preco: '', economiza: '' })
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  // Helper para formatar a lista de itens com segurança
  const formatarItens = (itens) => {
    if (!itens) return []
    if (Array.isArray(itens)) {
      return itens.map((item) => (typeof item === 'object' && item !== null ? item.nome || item.descricao : item))
    }
    if (typeof itens === 'string') {
      return itens.split(',').map((s) => s.trim())
    }
    return []
  }

  if (loading) return <div className="loading">Carregando combos...</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Combos</h2>
          <div className="muted">Agrupamentos de produtos com preço promocional</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Fechar formulário' : '+ Novo combo'}
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ padding: 18, marginBottom: 18 }} onSubmit={salvar}>
          <div className="form-grid">
            <div className="field">
              <label>Nome do combo</label>
              <input
                value={novo.nome}
                onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                placeholder="Ex: Combo Casal"
                required
                disabled={submitting}
              />
            </div>

            <div className="field">
              <label>Itens inclusos (separados por vírgula)</label>
              <input
                value={novo.itensText}
                onChange={(e) => setNovo({ ...novo, itensText: e.target.value })}
                placeholder="Ex: 2 Burger Clássico, 1 Batata Média, 2 Refrigerantes"
                disabled={submitting}
              />
            </div>

            <div className="field">
              <label>Preço promocional (R$)</label>
              <input
                type="number"
                step="0.01"
                value={novo.preco}
                onChange={(e) => setNovo({ ...novo, preco: e.target.value })}
                placeholder="0,00"
                required
                disabled={submitting}
              />
            </div>

            <div className="field">
              <label>Valor economizado (R$)</label>
              <input
                type="number"
                step="0.01"
                value={novo.economiza}
                onChange={(e) => setNovo({ ...novo, economiza: e.target.value })}
                placeholder="0,00"
                disabled={submitting}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar combo'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {combos.map((c, index) => {
          const precoNum = Number(c?.preco) || 0
          const economizaNum = Number(c?.economiza) || 0
          const estaAtivo = Boolean(c?.ativo)
          const listaItens = formatarItens(c?.itens)

          return (
            <div className="card" key={c.id || index} style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ fontWeight: 800, fontSize: 14.5 }}>{c.nome}</div>
                <button
                  className={`toggle ${estaAtivo ? 'on' : ''}`}
                  onClick={() => toggleAtivo(c.id, estaAtivo)}
                  title="Ativar/inativar combo"
                >
                  <span className="knob" />
                </button>
              </div>

              <ul style={{ margin: '10px 0', paddingLeft: 18, color: '#6B675F', fontSize: 13 }}>
                {listaItens.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span className="money" style={{ fontSize: 16 }}>
                  R$ {precoNum.toFixed(2)}
                </span>
                {economizaNum > 0 && (
                  <span className="pill pill-basil">economiza R$ {economizaNum.toFixed(2)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {combos.length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div className="empty-state">Nenhum combo cadastrado no banco de dados.</div>
        </div>
      )}
    </div>
  )
}