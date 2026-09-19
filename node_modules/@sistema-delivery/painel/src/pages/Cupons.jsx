import { useState } from 'react'
import { initialCupons } from '../data/mock'

const TIPO_LABEL = { percentual: '% de desconto', valor_fixo: 'Valor fixo', frete: 'Frete grátis' }

export default function Cupons() {
  const [cupons, setCupons] = useState(initialCupons)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ codigo: '', tipo: 'percentual', valor: '', minimo: '', validade: '' })

  const toggleAtivo = (id) => setCupons((prev) => prev.map((c) => (c.id === id ? { ...c, ativo: !c.ativo } : c)))

  const salvar = (e) => {
    e.preventDefault()
    if (!form.codigo) return
    setCupons((prev) => [
      ...prev,
      { id: Date.now(), codigo: form.codigo.toUpperCase(), tipo: form.tipo, valor: parseFloat(form.valor || 0), minimo: parseFloat(form.minimo || 0), validade: form.validade, usos: 0, ativo: true },
    ])
    setForm({ codigo: '', tipo: 'percentual', valor: '', minimo: '', validade: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Cupons de desconto</h2>
          <div className="muted">{cupons.filter((c) => c.ativo).length} cupom(ns) ativo(s)</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>+ Novo cupom</button>
      </div>

      {showForm && (
        <form className="card" style={{ padding: 18, marginBottom: 18 }} onSubmit={salvar}>
          <div className="form-grid">
            <div className="field">
              <label>Código do cupom</label>
              <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="Ex: PROMO15" required />
            </div>
            <div className="field">
              <label>Tipo de desconto</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="percentual">Percentual (%)</option>
                <option value="valor_fixo">Valor fixo (R$)</option>
                <option value="frete">Frete grátis</option>
              </select>
            </div>
            {form.tipo !== 'frete' && (
              <div className="field">
                <label>Valor do desconto</label>
                <input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
              </div>
            )}
            <div className="field">
              <label>Pedido mínimo (R$)</label>
              <input type="number" step="0.01" value={form.minimo} onChange={(e) => setForm({ ...form, minimo: e.target.value })} />
            </div>
            <div className="field">
              <label>Válido até</label>
              <input type="date" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" type="submit">Salvar cupom</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th><th>Tipo</th><th>Desconto</th><th>Pedido mínimo</th><th>Válido até</th><th>Usos</th><th>Ativo</th>
            </tr>
          </thead>
          <tbody>
            {cupons.map((c) => (
              <tr key={c.id}>
                <td className="order-id">{c.codigo}</td>
                <td>{TIPO_LABEL[c.tipo]}</td>
                <td className="money">{c.tipo === 'frete' ? '—' : c.tipo === 'percentual' ? `${c.valor}%` : `R$ ${c.valor.toFixed(2)}`}</td>
                <td className="money">R$ {c.minimo.toFixed(2)}</td>
                <td>{c.validade?.split('-').reverse().join('/')}</td>
                <td>{c.usos}</td>
                <td>
                  <button className={`toggle ${c.ativo ? 'on' : ''}`} onClick={() => toggleAtivo(c.id)}>
                    <span className="knob" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
