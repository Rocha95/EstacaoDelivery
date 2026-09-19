import { useState } from 'react'

export default function Topbar({ title, subtitle }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        {subtitle && <div className="subtitle">{subtitle}</div>}
      </div>
      <div className="topbar-status">
        <button
          className="store-open-pill"
          style={!open ? { background: '#F6DAD3', color: '#A6371F' } : undefined}
          onClick={() => setOpen((v) => !v)}
          title="Alternar status da loja (demonstração)"
        >
          <span className="dot" style={!open ? { background: '#A6371F' } : undefined} />
          {open ? 'Loja aberta' : 'Loja fechada'}
        </button>
      </div>
    </div>
  )
}
