import { useEffect, useState } from 'react'

const FORM_PADRAO = {
  nome: 'Estação Delivery',
  telefone: '(15) 99000-1122',
  endereco: 'Av. Presidente Vargas, 450 – Votorantim/SP',
  pedidoMinimo: '25.00',
  tempoPreparoMedio: '35',
  aceitaRetirada: true,
  aceitaDelivery: true,
}

export default function Configuracoes() {
  const [form, setForm] = useState(FORM_PADRAO)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // 1. Carrega as configurações do backend
  useEffect(() => {
    async function fetchConfiguracoes() {
      try {
        setLoading(true)
        const response = await fetch('/api/configuracoes')

        if (response.ok) {
          const data = await response.json()
          setForm({
            nome: data.nome ?? FORM_PADRAO.nome,
            telefone: data.telefone ?? FORM_PADRAO.telefone,
            endereco: data.endereco ?? FORM_PADRAO.endereco,
            pedidoMinimo: String(data.pedidoMinimo ?? data.pedido_minimo ?? FORM_PADRAO.pedidoMinimo),
            tempoPreparoMedio: String(data.tempoPreparoMedio ?? data.tempo_preparo_medio ?? FORM_PADRAO.tempoPreparoMedio),
            aceitaRetirada: Boolean(data.aceitaRetirada ?? data.aceita_retirada ?? FORM_PADRAO.aceitaRetirada),
            aceitaDelivery: Boolean(data.aceitaDelivery ?? data.aceita_delivery ?? FORM_PADRAO.aceitaDelivery),
          })
        } else {
          console.warn(`API /api/configuracoes retornou status ${response.status}. Usando valores padrão.`)
        }
      } catch (err) {
        console.warn('Erro de rede ou backend off-line ao buscar configurações:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchConfiguracoes()
  }, [])

  // 2. Salva as alterações (PUT /api/configuracoes)
  const salvar = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)

    const payload = {
      nome: form.nome.trim(),
      telefone: form.telefone.trim(),
      endereco: form.endereco.trim(),
      pedidoMinimo: parseFloat(form.pedidoMinimo) || 0,
      tempoPreparoMedio: parseInt(form.tempoPreparoMedio, 10) || 0,
      aceitaRetirada: form.aceitaRetirada,
      aceitaDelivery: form.aceitaDelivery,
    }

    try {
      const response = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
      } else {
        alert('Não foi possível salvar no servidor. Alterações mantidas na tela.')
      }
    } catch (err) {
      console.error(err)
      alert('Erro de conexão ao salvar as configurações.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Carregando configurações do estabelecimento...</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Configurações do estabelecimento</h2>
          <div className="muted">Dados gerais usados no cardápio do cliente</div>
        </div>
      </div>

      <form className="card" style={{ padding: 20, maxWidth: 680 }} onSubmit={salvar}>
        <div className="form-grid">
          <div className="field">
            <label>Nome do estabelecimento</label>
            <input
              value={form.nome}
              onChange={(e) => {
                setForm({ ...form, nome: e.target.value })
                setSavedSuccess(false)
              }}
              disabled={saving}
              required
            />
          </div>
          <div className="field">
            <label>Telefone / WhatsApp</label>
            <input
              value={form.telefone}
              onChange={(e) => {
                setForm({ ...form, telefone: e.target.value })
                setSavedSuccess(false)
              }}
              disabled={saving}
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Endereço</label>
            <input
              value={form.endereco}
              onChange={(e) => {
                setForm({ ...form, endereco: e.target.value })
                setSavedSuccess(false)
              }}
              disabled={saving}
            />
          </div>
          <div className="field">
            <label>Pedido mínimo (R$)</label>
            <input
              type="number"
              step="0.01"
              value={form.pedidoMinimo}
              onChange={(e) => {
                setForm({ ...form, pedidoMinimo: e.target.value })
                setSavedSuccess(false)
              }}
              disabled={saving}
            />
          </div>
          <div className="field">
            <label>Tempo médio de preparo (min)</label>
            <input
              type="number"
              value={form.tempoPreparoMedio}
              onChange={(e) => {
                setForm({ ...form, tempoPreparoMedio: e.target.value })
                setSavedSuccess(false)
              }}
              disabled={saving}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, marginTop: 18, marginBottom: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <button
              type="button"
              className={`toggle ${form.aceitaDelivery ? 'on' : ''}`}
              onClick={() => {
                setForm({ ...form, aceitaDelivery: !form.aceitaDelivery })
                setSavedSuccess(false)
              }}
              disabled={saving}
            >
              <span className="knob" />
            </button>
            Aceitar pedidos por delivery
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <button
              type="button"
              className={`toggle ${form.aceitaRetirada ? 'on' : ''}`}
              onClick={() => {
                setForm({ ...form, aceitaRetirada: !form.aceitaRetirada })
                setSavedSuccess(false)
              }}
              disabled={saving}
            >
              <span className="knob" />
            </button>
            Aceitar retirada no local
          </label>
        </div>

        <button className="btn btn-primary" type="submit" style={{ marginTop: 10 }} disabled={saving}>
          {saving ? 'Salvando...' : savedSuccess ? '✓ Salvo com sucesso!' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  )
}