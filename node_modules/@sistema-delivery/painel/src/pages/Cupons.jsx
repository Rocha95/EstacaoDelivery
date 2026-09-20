import { useEffect, useState } from 'react'

const FORM_VAZIO = {
  id: '',
  codigo: '',
  tipo: 'PERCENTUAL',
  valor: '',
  pedidoMinimo: '',
  validoAte: '',
}

const TIPO_LABEL = {
  PERCENTUAL: '% de desconto',
  VALOR_FIXO: 'Valor fixo',
  FRETE_GRATIS: 'Frete grátis',
}

function decimalParaInput(valor) {
  if (valor === null || valor === undefined || valor === '') return ''
  return Number(valor).toString()
}

function dataParaInput(valor) {
  if (!valor) return ''
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return ''
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function dataParaExibicao(valor) {
  if (!valor) return '—'
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return '—'
  return data.toLocaleDateString('pt-BR')
}

export default function Cupons() {
  const [cupons, setCupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ ...FORM_VAZIO })

  const carregar = async () => {
    const response = await fetch('/api/cupons')
    const data = await response.json().catch(() => [])
    if (!response.ok) throw new Error(data.erro || 'Não foi possível carregar os cupons.')
    setCupons(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    carregar()
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false))
  }, [])

  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  const abrirNovo = () => {
    setForm({ ...FORM_VAZIO })
    setShowForm(true)
  }

  const editar = (cupom) => {
    setForm({
      id: cupom.id,
      codigo: cupom.codigo || '',
      tipo: cupom.tipo || 'PERCENTUAL',
      valor: decimalParaInput(cupom.valor),
      pedidoMinimo: decimalParaInput(cupom.pedidoMinimo),
      validoAte: dataParaInput(cupom.validoAte),
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelar = () => {
    if (submitting) return
    setForm({ ...FORM_VAZIO })
    setShowForm(false)
  }

  const resetFormulario = () => {
    setForm({ ...FORM_VAZIO })
    setShowForm(false)
  }

  const salvar = async (e) => {
    e.preventDefault()

    const codigo = form.codigo.trim().toUpperCase()
    const valor = form.tipo === 'FRETE_GRATIS' ? 0 : Number(form.valor || 0)
    const pedidoMinimo = Number(form.pedidoMinimo || 0)

    if (!codigo) {
      alert('Informe o código do cupom.')
      return
    }

    if (!Number.isFinite(valor) || valor < 0) {
      alert('Informe um valor de desconto válido.')
      return
    }

    if (form.tipo === 'PERCENTUAL' && valor > 100) {
      alert('O desconto percentual não pode ser maior que 100%.')
      return
    }

    if (!Number.isFinite(pedidoMinimo) || pedidoMinimo < 0) {
      alert('Informe um pedido mínimo válido.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        codigo,
        tipo: form.tipo,
        valor,
        pedidoMinimo,
        validoAte: form.validoAte || null,
      }

      const response = await fetch(form.id ? `/api/cupons/${form.id}` : '/api/cupons', {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.erro || data.message || 'Não foi possível salvar o cupom.')

      if (form.id) {
        setCupons((prev) => prev.map((cupom) => (cupom.id === data.id ? { ...cupom, ...data } : cupom)))
      } else {
        setCupons((prev) => [data, ...prev])
      }

      resetFormulario()
    } catch (err) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleAtivo = async (cupom) => {
    try {
      const response = await fetch(`/api/cupons/${cupom.id}/ativo`, { method: 'PATCH' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.erro || 'Não foi possível atualizar o cupom.')
      setCupons((prev) => prev.map((item) => (item.id === cupom.id ? { ...item, ...data } : item)))
    } catch (err) {
      alert(`Erro: ${err.message}`)
    }
  }

  if (loading) return <div className="loading">Carregando cupons...</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Cupons de desconto</h2>
          <div className="muted">{cupons.filter((c) => c.ativo).length} cupom(ns) ativo(s)</div>
        </div>
        <button className="btn btn-primary" onClick={showForm ? cancelar : abrirNovo} disabled={submitting}>
          {showForm ? 'Fechar formulário' : '+ Novo cupom'}
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ padding: 18, marginBottom: 18 }} onSubmit={salvar}>
          <div className="form-grid">
            <div className="field">
              <label>Código do cupom</label>
              <input
                value={form.codigo}
                onChange={(e) => atualizarCampo('codigo', e.target.value.toUpperCase())}
                placeholder="Ex: PROMO15"
                required
                disabled={submitting}
              />
            </div>

            <div className="field">
              <label>Tipo de desconto</label>
              <select value={form.tipo} onChange={(e) => atualizarCampo('tipo', e.target.value)} disabled={submitting}>
                <option value="PERCENTUAL">Percentual (%)</option>
                <option value="VALOR_FIXO">Valor fixo (R$)</option>
                <option value="FRETE_GRATIS">Frete grátis</option>
              </select>
            </div>

            {form.tipo !== 'FRETE_GRATIS' && (
              <div className="field">
                <label>Valor do desconto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={form.tipo === 'PERCENTUAL' ? '100' : undefined}
                  value={form.valor}
                  onChange={(e) => atualizarCampo('valor', e.target.value)}
                  placeholder={form.tipo === 'PERCENTUAL' ? 'Ex: 15' : '0,00'}
                  required
                  disabled={submitting}
                />
              </div>
            )}

            <div className="field">
              <label>Pedido mínimo (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.pedidoMinimo}
                onChange={(e) => atualizarCampo('pedidoMinimo', e.target.value)}
                placeholder="0,00"
                disabled={submitting}
              />
            </div>

            <div className="field">
              <label>Válido até</label>
              <input
                type="date"
                value={form.validoAte}
                onChange={(e) => atualizarCampo('validoAte', e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : form.id ? 'Salvar alterações' : 'Salvar cupom'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={cancelar} disabled={submitting}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Desconto</th>
              <th>Pedido mínimo</th>
              <th>Válido até</th>
              <th>Usos</th>
              <th>Ativo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cupons.map((c) => {
              const valor = Number(c.valor) || 0
              const minimo = Number(c.pedidoMinimo) || 0

              return (
                <tr key={c.id}>
                  <td className="order-id">{c.codigo}</td>
                  <td>{TIPO_LABEL[c.tipo] || c.tipo}</td>
                  <td className="money">
                    {c.tipo === 'FRETE_GRATIS'
                      ? '—'
                      : c.tipo === 'PERCENTUAL'
                        ? `${valor}%`
                        : `R$ ${valor.toFixed(2)}`}
                  </td>
                  <td className="money">R$ {minimo.toFixed(2)}</td>
                  <td>{dataParaExibicao(c.validoAte)}</td>
                  <td>{c.usos ?? 0}</td>
                  <td>
                    <button
                      className={`toggle ${c.ativo ? 'on' : ''}`}
                      onClick={() => toggleAtivo(c)}
                      title={c.ativo ? 'Inativar cupom' : 'Ativar cupom'}
                    >
                      <span className="knob" />
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-ghost" onClick={() => editar(c)} disabled={submitting}>
                      Editar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {cupons.length === 0 && (
          <div className="empty-state" style={{ padding: 24, textAlign: 'center' }}>
            Nenhum cupom cadastrado no banco de dados.
          </div>
        )}
      </div>
    </div>
  )
}
