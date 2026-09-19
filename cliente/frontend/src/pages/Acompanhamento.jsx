import { useParams } from 'react-router-dom'
import TopNavBack from '../components/TopNavBack'

const ETAPAS = [
  { chave: 'recebido', label: 'Pedido recebido', hora: '19:44', icon: '🧾' },
  { chave: 'producao', label: 'Em produção', hora: '19:47', icon: '👨‍🍳' },
  { chave: 'entrega', label: 'Saiu para entrega', hora: null, icon: '🛵' },
  { chave: 'finalizado', label: 'Entregue', hora: null, icon: '🎉' },
]

// Estágio atual mockado — no backend real isso viria da API/websocket.
const ETAPA_ATUAL = 1

export default function Acompanhamento() {
  const { id } = useParams()

  return (
    <div className="app-frame">
      <TopNavBack title={`Pedido #${id}`} to="/" />
      <div className="content">
        <div className="card" style={{ marginBottom: 18, textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, color: '#8A867C' }}>Previsão de entrega</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>19:55 – 20:10</div>
        </div>

        <div className="tracker">
          {ETAPAS.map((etapa, i) => (
            <div key={etapa.chave} className={`tracker-step ${i < ETAPA_ATUAL ? 'done' : i === ETAPA_ATUAL ? 'current' : ''}`}>
              <div className="tracker-dot">{i <= ETAPA_ATUAL ? etapa.icon : i + 1}</div>
              <div>
                <div className="label">{etapa.label}</div>
                {etapa.hora && i <= ETAPA_ATUAL && <div className="time">{etapa.hora}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="section-title">Itens do pedido</div>
        <div className="card">
          <div className="list-row"><div className="list-thumb">🍔</div><div style={{ flex: 1 }}>1x Combo Smash Duplo</div></div>
          <div className="list-row"><div className="list-thumb">🥤</div><div style={{ flex: 1 }}>1x Coca 350ml</div></div>
        </div>
      </div>
    </div>
  )
}
