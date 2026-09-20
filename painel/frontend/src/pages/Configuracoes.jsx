import { useEffect, useState } from 'react'

const FORM_PADRAO = {
  nomeEstabelecimento: 'Estação Delivery',
  telefone: '(15) 99000-1122',
  endereco: '',
  pedidoMinimo: '25.00',
  tempoPreparoMedioMin: '35',
  raioMaximoEntregaKm: '12',
  aceitaRetirada: true,
  aceitaDelivery: true,
}

export default function Configuracoes() {
  const [form, setForm] = useState(FORM_PADRAO)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/configuracoes')
      .then((r) => r.ok ? r.json() : Promise.reject(new Error('Falha ao carregar configurações')))
      .then((data) => setForm({
        nomeEstabelecimento: data.nomeEstabelecimento ?? FORM_PADRAO.nomeEstabelecimento,
        telefone: data.telefone ?? '',
        endereco: data.endereco ?? '',
        pedidoMinimo: String(data.pedidoMinimo ?? 0),
        tempoPreparoMedioMin: String(data.tempoPreparoMedioMin ?? 30),
        raioMaximoEntregaKm: String(data.raioMaximoEntregaKm ?? 12),
        aceitaRetirada: Boolean(data.aceitaRetirada),
        aceitaDelivery: Boolean(data.aceitaDelivery),
      }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const salvar = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)
    try {
      const response = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          pedidoMinimo: Number(form.pedidoMinimo) || 0,
          tempoPreparoMedioMin: Number(form.tempoPreparoMedioMin) || 0,
          raioMaximoEntregaKm: Number(form.raioMaximoEntregaKm) || 0,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.erro || data.message || 'Não foi possível salvar.')
      setForm((prev) => ({ ...prev, ...data, pedidoMinimo: String(data.pedidoMinimo ?? prev.pedidoMinimo), tempoPreparoMedioMin: String(data.tempoPreparoMedioMin ?? prev.tempoPreparoMedioMin), raioMaximoEntregaKm: String(data.raioMaximoEntregaKm ?? prev.raioMaximoEntregaKm) }))
      setSavedSuccess(true)
      if (data.aviso) alert(data.aviso)
      setTimeout(() => setSavedSuccess(false), 2500)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Carregando configurações...</div>

  return (
    <div>
      <div className="section-head"><div><h2>Configurações do estabelecimento</h2><div className="muted">Dados usados pelo cardápio do cliente</div></div></div>
      <form className="card" style={{ padding: 20, maxWidth: 680 }} onSubmit={salvar}>
        <div className="form-grid">
          <div className="field"><label>Nome do estabelecimento</label><input value={form.nomeEstabelecimento} onChange={(e) => setForm({ ...form, nomeEstabelecimento: e.target.value })} required /></div>
          <div className="field"><label>Telefone / WhatsApp</label><input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Endereço do estabelecimento</label><input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número, bairro, cidade - UF" /><div className="muted" style={{ marginTop: 6 }}>Este endereço fica salvo no banco e é usado como origem para calcular automaticamente a rota e a taxa de entrega.</div></div>
          <div className="field"><label>Pedido mínimo (R$)</label><input type="number" step="0.01" value={form.pedidoMinimo} onChange={(e) => setForm({ ...form, pedidoMinimo: e.target.value })} /></div>
          <div className="field"><label>Tempo médio (min)</label><input type="number" value={form.tempoPreparoMedioMin} onChange={(e) => setForm({ ...form, tempoPreparoMedioMin: e.target.value })} /></div>
          <div className="field"><label>Raio de entrega (km)</label><input type="number" step="0.1" value={form.raioMaximoEntregaKm} onChange={(e) => setForm({ ...form, raioMaximoEntregaKm: e.target.value })} /></div>
        </div>
        <div style={{ display: 'flex', gap: 24, margin: '18px 0 10px' }}>
          <label><input type="checkbox" checked={form.aceitaDelivery} onChange={(e) => setForm({ ...form, aceitaDelivery: e.target.checked })} /> Aceitar delivery</label>
          <label><input type="checkbox" checked={form.aceitaRetirada} onChange={(e) => setForm({ ...form, aceitaRetirada: e.target.checked })} /> Aceitar retirada</label>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : savedSuccess ? '✓ Salvo' : 'Salvar alterações'}</button>
      </form>
    </div>
  )
}
