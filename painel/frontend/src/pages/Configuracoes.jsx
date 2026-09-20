import { useEffect, useState } from 'react'

const FORM_PADRAO = {
  nomeEstabelecimento: 'Estação Delivery',
  telefone: '(15) 99000-1122',
  enderecoRua: '',
  enderecoNumero: '',
  enderecoBairro: '',
  enderecoCidade: '',
  enderecoEstado: '',
  enderecoCep: '',
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
        ...FORM_PADRAO,
        nomeEstabelecimento: data.nomeEstabelecimento ?? FORM_PADRAO.nomeEstabelecimento,
        telefone: data.telefone ?? '',
        enderecoRua: data.enderecoRua ?? data.endereco ?? '',
        enderecoNumero: data.enderecoNumero ?? '',
        enderecoBairro: data.enderecoBairro ?? '',
        enderecoCidade: data.enderecoCidade ?? '',
        enderecoEstado: data.enderecoEstado ?? '',
        enderecoCep: data.enderecoCep ?? '',
        pedidoMinimo: String(data.pedidoMinimo ?? 0),
        tempoPreparoMedioMin: String(data.tempoPreparoMedioMin ?? 30),
        raioMaximoEntregaKm: String(data.raioMaximoEntregaKm ?? 12),
        aceitaRetirada: Boolean(data.aceitaRetirada),
        aceitaDelivery: Boolean(data.aceitaDelivery),
      }))
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false))
  }, [])

  const alterar = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setSavedSuccess(false)
  }

  const salvar = async (e) => {
    e.preventDefault()
    if (!form.enderecoRua.trim() || !form.enderecoNumero.trim() || !form.enderecoBairro.trim() || !form.enderecoCidade.trim() || !form.enderecoEstado.trim()) {
      alert('Informe rua, número, bairro, cidade e estado do estabelecimento.')
      return
    }
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
      setForm((prev) => ({
        ...prev,
        ...data,
        pedidoMinimo: String(data.pedidoMinimo ?? prev.pedidoMinimo),
        tempoPreparoMedioMin: String(data.tempoPreparoMedioMin ?? prev.tempoPreparoMedioMin),
        raioMaximoEntregaKm: String(data.raioMaximoEntregaKm ?? prev.raioMaximoEntregaKm),
      }))
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
      <div className="section-head"><div><h2>Configurações do estabelecimento</h2><div className="muted">Dados usados pelo cardápio do cliente e cálculo das entregas</div></div></div>
      <form className="card" style={{ padding: 20, maxWidth: 760 }} onSubmit={salvar}>
        <div className="form-grid">
          <div className="field"><label>Nome do estabelecimento</label><input value={form.nomeEstabelecimento} onChange={(e) => alterar('nomeEstabelecimento', e.target.value)} required disabled={saving} /></div>
          <div className="field"><label>Telefone / WhatsApp</label><input value={form.telefone} onChange={(e) => alterar('telefone', e.target.value)} disabled={saving} /></div>
        </div>

        <h3 style={{ margin: '22px 0 12px' }}>Endereço de origem</h3>
        <div className="form-grid">
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Rua</label><input value={form.enderecoRua} onChange={(e) => alterar('enderecoRua', e.target.value)} placeholder="Ex.: Rua Barão de Cotegipe" required disabled={saving} /></div>
          <div className="field"><label>Número</label><input value={form.enderecoNumero} onChange={(e) => alterar('enderecoNumero', e.target.value)} placeholder="Ex.: 300" required disabled={saving} /></div>
          <div className="field"><label>Bairro</label><input value={form.enderecoBairro} onChange={(e) => alterar('enderecoBairro', e.target.value)} placeholder="Ex.: Vila Independência" required disabled={saving} /></div>
          <div className="field"><label>Cidade</label><input value={form.enderecoCidade} onChange={(e) => alterar('enderecoCidade', e.target.value)} placeholder="Ex.: Sorocaba" required disabled={saving} /></div>
          <div className="field"><label>Estado (UF)</label><input maxLength={2} value={form.enderecoEstado} onChange={(e) => alterar('enderecoEstado', e.target.value.toUpperCase())} placeholder="SP" required disabled={saving} /></div>
          <div className="field"><label>CEP</label><input value={form.enderecoCep} onChange={(e) => alterar('enderecoCep', e.target.value)} placeholder="00000-000" disabled={saving} /></div>
        </div>
        <div className="muted" style={{ marginTop: 8 }}>O sistema usa esses campos para localizar o estabelecimento com maior precisão e calcular a rota real até o cliente.</div>

        <div className="form-grid" style={{ marginTop: 18 }}>
          <div className="field"><label>Pedido mínimo (R$)</label><input type="number" step="0.01" value={form.pedidoMinimo} onChange={(e) => alterar('pedidoMinimo', e.target.value)} disabled={saving} /></div>
          <div className="field"><label>Tempo médio (min)</label><input type="number" min="0" value={form.tempoPreparoMedioMin} onChange={(e) => alterar('tempoPreparoMedioMin', e.target.value)} disabled={saving} /></div>
          <div className="field"><label>Raio máximo de entrega (km)</label><input type="number" step="0.1" min="0" value={form.raioMaximoEntregaKm} onChange={(e) => alterar('raioMaximoEntregaKm', e.target.value)} disabled={saving} /></div>
        </div>
        <div style={{ display: 'flex', gap: 24, margin: '18px 0 10px' }}>
          <label><input type="checkbox" checked={form.aceitaDelivery} onChange={(e) => alterar('aceitaDelivery', e.target.checked)} disabled={saving} /> Aceitar delivery</label>
          <label><input type="checkbox" checked={form.aceitaRetirada} onChange={(e) => alterar('aceitaRetirada', e.target.checked)} disabled={saving} /> Aceitar retirada</label>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : savedSuccess ? '✓ Salvo' : 'Salvar alterações'}</button>
      </form>
    </div>
  )
}
