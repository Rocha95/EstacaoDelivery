import { useState } from 'react'
import { initialHorarios } from '../data/mock'

export default function Horarios() {
  const [horarios, setHorarios] = useState(initialHorarios)

  const update = (dia, campo, valor) =>
    setHorarios((prev) => prev.map((h) => (h.dia === dia ? { ...h, [campo]: valor } : h)))

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Horários de funcionamento</h2>
          <div className="muted">Define quando o cardápio fica disponível para pedidos</div>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Dia</th>
              <th>Aceita pedidos</th>
              <th>Abre</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((h) => (
              <tr key={h.dia}>
                <td style={{ fontWeight: 700 }}>{h.dia}</td>
                <td>
                  <button className={`toggle ${h.ativo ? 'on' : ''}`} onClick={() => update(h.dia, 'ativo', !h.ativo)}>
                    <span className="knob" />
                  </button>
                </td>
                <td>
                  <input type="time" value={h.abre} disabled={!h.ativo} onChange={(e) => update(h.dia, 'abre', e.target.value)}
                    style={{ padding: '6px 9px', border: '1px solid var(--line)', borderRadius: 6, opacity: h.ativo ? 1 : 0.4 }} />
                </td>
                <td>
                  <input type="time" value={h.fecha} disabled={!h.ativo} onChange={(e) => update(h.dia, 'fecha', e.target.value)}
                    style={{ padding: '6px 9px', border: '1px solid var(--line)', borderRadius: 6, opacity: h.ativo ? 1 : 0.4 }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: '#8A867C', marginTop: 10 }}>
        Fora desses horários, o cliente vê o cardápio como indisponível para novos pedidos — produtos com horário próprio (aba Produtos) seguem sua própria janela dentro do funcionamento geral.
      </p>
    </div>
  )
}
