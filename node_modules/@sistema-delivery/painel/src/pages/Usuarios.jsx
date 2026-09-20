import { useEffect, useState } from 'react'

const PAPEL_PARA_API = { Administrador: 'ADMINISTRADOR', Gerente: 'GERENTE', Atendente: 'ATENDIMENTO', Cozinha: 'COZINHA' }
const PAPEL_PARA_TELA = { ADMINISTRADOR: 'Administrador', GERENTE: 'Gerente', ATENDIMENTO: 'Atendente', COZINHA: 'Cozinha' }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [novo, setNovo] = useState({ nome: '', email: '', senha: '', papel: 'Atendente' })

  const carregar = async () => {
    const response = await fetch('/api/usuarios')
    const data = await response.json().catch(() => [])
    if (!response.ok) throw new Error(data.erro || 'Não foi possível carregar os usuários.')
    setUsuarios(Array.isArray(data) ? data : [])
  }

  useEffect(() => { carregar().catch((err) => alert(err.message)).finally(() => setLoading(false)) }, [])

  const toggleAtivo = async (id, statusAtual) => {
    try {
      const response = await fetch(`/api/usuarios/${id}/ativo`, { method: 'PATCH' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.erro || 'Falha ao atualizar acesso.')
      setUsuarios((prev) => prev.map((u) => u.id === id ? data : u))
    } catch (err) { alert(err.message) }
  }

  const salvar = async (e) => {
    e.preventDefault()
    if (!novo.nome.trim() || !novo.email.trim() || !novo.senha.trim()) return alert('Informe nome, e-mail e senha inicial.')
    setSubmitting(true)
    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novo.nome.trim(), email: novo.email.trim(), papel: PAPEL_PARA_API[novo.papel], senha: novo.senha }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.erro || 'Não foi possível cadastrar o usuário.')
      setUsuarios((prev) => [...prev, data])
      setNovo({ nome: '', email: '', senha: '', papel: 'Atendente' })
      setShowForm(false)
    } catch (err) { alert(err.message) } finally { setSubmitting(false) }
  }

  if (loading) return <div className="loading">Carregando usuários do painel...</div>

  return (
    <div>
      <div className="section-head"><div><h2>Usuários do painel</h2><div className="muted">Quem tem acesso e com qual função</div></div><button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Fechar formulário' : '+ Novo usuário'}</button></div>
      {showForm && <form className="card" style={{ padding: 18, marginBottom: 18 }} onSubmit={salvar}>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
          <div className="field"><label>Nome completo</label><input value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} required disabled={submitting} /></div>
          <div className="field"><label>E-mail</label><input type="email" value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} required disabled={submitting} /></div>
          <div className="field"><label>Senha inicial</label><input type="password" minLength="6" value={novo.senha} onChange={(e) => setNovo({ ...novo, senha: e.target.value })} required disabled={submitting} /></div>
          <div className="field"><label>Função / Papel</label><select value={novo.papel} onChange={(e) => setNovo({ ...novo, papel: e.target.value })} disabled={submitting}><option>Administrador</option><option>Gerente</option><option>Atendente</option><option>Cozinha</option></select></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar usuário'}</button><button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} disabled={submitting}>Cancelar</button></div>
      </form>}
      <div className="card"><table className="data-table"><thead><tr><th>Nome</th><th>Função</th><th>E-mail</th><th>Acesso ativo</th></tr></thead><tbody>
        {usuarios.map((u, index) => { const estaAtivo = Boolean(u.ativo); return <tr key={u.id || index}><td style={{ fontWeight: 700 }}>{u.nome}</td><td><span className="pill pill-sky">{PAPEL_PARA_TELA[u.papel] || u.papel || 'Atendente'}</span></td><td style={{ color: '#6B675F' }}>{u.email}</td><td><button className={`toggle ${estaAtivo ? 'on' : ''}`} onClick={() => toggleAtivo(u.id, estaAtivo)}><span className="knob" /></button></td></tr> })}
      </tbody></table>{usuarios.length === 0 && <div style={{ padding: 24, textAlign: 'center' }}><div className="empty-state">Nenhum usuário cadastrado no banco de dados.</div></div>}</div>
    </div>
  )
}
