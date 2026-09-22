import { useEffect, useState } from 'react'

function formatAgendamento(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function Cozinha() {
  const [pedidos, setPedidos] = useState([])
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [iniciando, setIniciando] = useState(null)

  const carregar = () => fetch('/api/cozinha')
    .then(async r => {
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data?.erro || 'Não foi possível carregar a cozinha.')
      return data
    })
    .then(data => { setPedidos(data); setErro('') })
    .catch(e => setErro(e.message || 'Não foi possível carregar a cozinha.'))

  useEffect(() => {
    carregar()
    const t = setInterval(carregar, 10000)
    return () => clearInterval(t)
  }, [])

  const iniciar = async (pedido) => {
    setAviso('')
    const agendado = pedido.agendadoPara && new Date(pedido.agendadoPara).getTime() > Date.now()
    if (agendado) {
      setAviso(`Este pedido está agendado para ${formatAgendamento(pedido.agendadoPara)}. A produção só poderá ser iniciada a partir do horário agendado.`)
      return
    }
    setIniciando(pedido.id)
    try {
      const r = await fetch(`/api/cozinha/${pedido.id}/iniciar`, { method: 'PATCH' })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.erro || 'Não foi possível iniciar a produção.')
      await carregar()
    } catch (e) {
      setAviso(e.message || 'Não foi possível iniciar a produção.')
    } finally {
      setIniciando(null)
    }
  }

  return <div>
    <div className="section-head">
      <div><h2>KDS / Cozinha</h2><div className="muted">Pedidos recebidos e em produção, atualizados automaticamente</div></div>
    </div>
    {erro && <div className="card" style={{ color: '#d32f2f', marginBottom: 14 }}>{erro}</div>}
    {aviso && <div className="card" role="alert" style={{ color: '#76530b', background: '#fff8e7', borderColor: '#d9a441', marginBottom: 14 }}><strong>⏰ Pedido agendado</strong><div style={{ marginTop: 4 }}>{aviso}</div><button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setAviso('')}>Fechar</button></div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
      {pedidos.map(p => {
        const agendado = p.agendadoPara && new Date(p.agendadoPara).getTime() > Date.now()
        return <div className="card" key={p.id}>
          <div style={{display:'flex',justifyContent:'space-between'}}><strong>#{p.numero}</strong><span className="pill">{p.status}</span></div>
          <div className="muted" style={{margin:'8px 0'}}>{p.cliente?.nome}</div>
          {agendado && <div style={{padding:'8px 10px',borderRadius:6,background:'#fff8e7',color:'#76530b',fontSize:12,marginBottom:10}}><strong>Agendado</strong><br />{formatAgendamento(p.agendadoPara)}<br />A produção ficará disponível no horário agendado.</div>}
          {p.itens.map(i=><div key={i.id} style={{margin:'6px 0'}}><strong>{i.quantidade}x</strong> {i.nome}{i.adicionais?.length>0&&<div className="muted" style={{paddingLeft:20}}>{i.adicionais.map(a=>a.nome).join(', ')}</div>}</div>)}
          {p.status==='RECEBIDO'&&<button className="btn btn-primary" style={{width:'100%',marginTop:12}} disabled={iniciando===p.id || agendado} onClick={()=>iniciar(p)}>{iniciando===p.id?'Iniciando...':agendado?'Aguardando horário':'Iniciar produção'}</button>}
        </div>
      })}
    </div>
    {!pedidos.length&&<div className="card empty-state">Nenhum pedido na cozinha.</div>}
  </div>
}
