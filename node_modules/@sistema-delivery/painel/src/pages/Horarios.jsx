import { useEffect, useState } from 'react'

const DIAS = [
  { diaSemana: 0, dia: 'Domingo' },
  { diaSemana: 1, dia: 'Segunda' },
  { diaSemana: 2, dia: 'Terça' },
  { diaSemana: 3, dia: 'Quarta' },
  { diaSemana: 4, dia: 'Quinta' },
  { diaSemana: 5, dia: 'Sexta' },
  { diaSemana: 6, dia: 'Sábado' },
]

const PADRAO = DIAS.map((d) => ({ ...d, ativo: d.diaSemana !== 0, abre: d.diaSemana === 0 ? '17:00' : '11:00', fecha: d.diaSemana >= 5 ? '23:59' : '23:00' }))

export default function Horarios() {
  const [horarios, setHorarios] = useState(PADRAO)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/horarios')
      .then((r) => r.ok ? r.json() : Promise.reject(new Error('Não foi possível carregar os horários.')))
      .then((data) => {
        const porDia = new Map((Array.isArray(data) ? data : []).map((h) => [Number(h.diaSemana), h]))
        setHorarios(PADRAO.map((padrao) => ({ ...padrao, ...(porDia.get(padrao.diaSemana) || {}) })))
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false))
  }, [])

  const update = (diaSemana, campo, valor) => {
    setHorarios((prev) => prev.map((h) => h.diaSemana === diaSemana ? { ...h, [campo]: valor } : h))
    setSavedSuccess(false)
  }

  const salvar = async () => {
    setSaving(true)
    setSavedSuccess(false)
    try {
      for (const horario of horarios) {
        const response = await fetch(`/api/horarios/${horario.diaSemana}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ativo: Boolean(horario.ativo), abre: horario.abre, fecha: horario.fecha }),
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.erro || 'Não foi possível salvar os horários.')
      }
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Carregando horários...</div>

  return (
    <div>
      <div className="section-head">
        <div><h2>Horários de funcionamento</h2><div className="muted">Define quando o cardápio fica disponível para pedidos</div></div>
        <button className="btn btn-primary" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : savedSuccess ? '✓ Salvo' : 'Salvar alterações'}
        </button>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Dia</th><th>Aceita pedidos</th><th>Abre</th><th>Fecha</th></tr></thead>
          <tbody>
            {horarios.map((h) => (
              <tr key={h.diaSemana}>
                <td style={{ fontWeight: 700 }}>{h.dia}</td>
                <td><button type="button" className={`toggle ${h.ativo ? 'on' : ''}`} onClick={() => update(h.diaSemana, 'ativo', !h.ativo)} disabled={saving}><span className="knob" /></button></td>
                <td><input type="time" value={h.abre || ''} disabled={!h.ativo || saving} onChange={(e) => update(h.diaSemana, 'abre', e.target.value)} style={{ padding: '6px 9px', border: '1px solid var(--line)', borderRadius: 6, opacity: h.ativo ? 1 : 0.4 }} /></td>
                <td><input type="time" value={h.fecha || ''} disabled={!h.ativo || saving} onChange={(e) => update(h.diaSemana, 'fecha', e.target.value)} style={{ padding: '6px 9px', border: '1px solid var(--line)', borderRadius: 6, opacity: h.ativo ? 1 : 0.4 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: '#8A867C', marginTop: 10 }}>Fora desses horários, o cliente vê o cardápio como indisponível para novos pedidos — produtos com horário próprio seguem sua própria janela dentro do funcionamento geral.</p>
    </div>
  )
}
