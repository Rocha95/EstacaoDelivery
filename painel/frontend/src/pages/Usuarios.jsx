import { useEffect, useState } from 'react'

const PAPEL_PARA_API = { Administrador: 'ADMINISTRADOR', Gerente: 'GERENTE', Atendente: 'ATENDIMENTO', Cozinha: 'COZINHA' }
const PAPEL_PARA_TELA = { ADMINISTRADOR: 'Administrador', GERENTE: 'Gerente', ATENDIMENTO: 'Atendente', COZINHA: 'Cozinha' }

const FORM_VAZIO = { id: null, nome: '', email: '', senha: '', papel: 'Atendente', podeCriarUsuarios: false }
const usuarioLogado = () => { try { return JSON.parse(localStorage.getItem('painelUsuario') || '{}') } catch { return {} } }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [novo, setNovo] = useState(FORM_VAZIO)
  const [meuUsuario] = useState(usuarioLogado())
  const podeCriar = meuUsuario.papel === 'ADMINISTRADOR' && Boolean(meuUsuario.podeCriarUsuarios)

  const carregar = async () => {
    const response = await fetch('/api/usuarios')
    const data = await response.json().catch(() => [])
    if (!response.ok) throw new Error(data.erro || 'Não foi possível carregar os usuários.')
    setUsuarios(Array.isArray(data) ? data : [])
  }

  useEffect(() => { carregar().catch((err) => alert(err.message)).finally(() => setLoading(false)) }, [])

  const abrirNovo = () => {
    setNovo({ ...FORM_VAZIO })
    setShowForm(true)
  }

  const editar = (usuario) => {
    setNovo({
      id: usuario.id,
      nome: usuario.nome || '',
      email: usuario.email || '',
      senha: '',
      papel: PAPEL_PARA_TELA[usuario.papel] || 'Atendente',
      podeCriarUsuarios: Boolean(usuario.podeCriarUsuarios),
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fecharForm = () => {
    setNovo({ ...FORM_VAZIO })
    setShowForm(false)
  }

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
    if (!novo.nome.trim() || !novo.email.trim()) return alert('Informe nome e e-mail.')
    if (!novo.id && !novo.senha.trim()) return alert('Informe a senha inicial.')
    if (novo.senha && novo.senha.length < 6) return alert('A senha deve ter pelo menos 6 caracteres.')

    setSubmitting(true)
    try {
      const payload = {
        nome: novo.nome.trim(),
        email: novo.email.trim(),
        papel: PAPEL_PARA_API[novo.papel],
        podeCriarUsuarios: Boolean(novo.podeCriarUsuarios),
      }
      if (novo.senha.trim()) payload.senha = novo.senha

      const response = await fetch(novo.id ? `/api/usuarios/${novo.id}` : '/api/usuarios', {
        method: novo.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.erro || data.message || 'Não foi possível salvar o usuário.')

      if (novo.id) setUsuarios((prev) => prev.map((u) => u.id === novo.id ? data : u))
      else setUsuarios((prev) => [...prev, data])
      fecharForm()
    } catch (err) { alert(err.message) } finally { setSubmitting(false) }
  }

  if (loading) return <div className="loading">Carregando usuários do painel...</div>

  return (
    <div>
      <div className="section-head">
        <div><h2>Usuários do painel</h2><div className="muted">Quem tem acesso e com qual função</div></div>
        <button className="btn btn-primary" disabled={!podeCriar} title={!podeCriar ? 'Apenas administradores autorizados podem criar usuários.' : ''} onClick={() => showForm ? fecharForm() : abrirNovo()}>{showForm ? 'Fechar formulário' : '+ Novo usuário'}</button>
      </div>

      {showForm && <form className="card" style={{ padding: 18, marginBottom: 18 }} onSubmit={salvar}>
        <h3>{novo.id ? 'Editar usuário' : 'Novo usuário'}</h3>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
          <div className="field"><label>Nome completo</label><input value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} required disabled={submitting} /></div>
          <div className="field"><label>E-mail</label><input type="email" value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} required disabled={submitting} /></div>
          <div className="field"><label>{novo.id ? 'Nova senha (opcional)' : 'Senha inicial'}</label><input type="password" minLength="6" value={novo.senha} onChange={(e) => setNovo({ ...novo, senha: e.target.value })} required={!novo.id} placeholder={novo.id ? 'Deixe em branco para manter' : ''} disabled={submitting} /></div>
          <div className="field"><label>Função / Papel</label><select value={novo.papel} onChange={(e) => setNovo({ ...novo, papel: e.target.value })} disabled={submitting}><option>Administrador</option><option>Gerente</option><option>Atendente</option><option>Cozinha</option></select></div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}><input type="checkbox" checked={novo.podeCriarUsuarios} onChange={e => setNovo({ ...novo, podeCriarUsuarios: e.target.checked })} disabled={submitting || !podeCriar} /> <span><strong>Pode criar outros usuários</strong><br/><small className="muted">Somente administradores podem conceder esta permissão.</small></span></label>{novo.id && <div className="muted" style={{ marginTop: 8 }}>Altere apenas os dados que precisam ser atualizados. A senha é opcional.</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Salvando...' : novo.id ? 'Salvar alterações' : 'Salvar usuário'}</button><button type="button" className="btn btn-ghost" onClick={fecharForm} disabled={submitting}>Cancelar</button></div>
      </form>}

      <div className="card"><table className="data-table"><thead><tr><th>Nome</th><th>Função</th><th>E-mail</th><th>Acesso ativo</th><th style={{ textAlign: 'right' }}>Ações</th></tr></thead><tbody>
        {usuarios.map((u, index) => { const estaAtivo = Boolean(u.ativo); return <tr key={u.id || index}><td style={{ fontWeight: 700 }}>{u.nome}</td><td><span className="pill pill-sky">{PAPEL_PARA_TELA[u.papel] || u.papel || 'Atendente'}</span></td><td style={{ color: '#6B675F' }}>{u.email}</td><td><button className={`toggle ${estaAtivo ? 'on' : ''}`} onClick={() => toggleAtivo(u.id, estaAtivo)} title={estaAtivo ? 'Desativar acesso' : 'Ativar acesso'}><span className="knob" /></button></td><td style={{ textAlign: 'right' }}><button className="btn btn-ghost btn-sm" onClick={() => editar(u)}>Editar</button></td></tr> })}
      </tbody></table>{usuarios.length === 0 && <div style={{ padding: 24, textAlign: 'center' }}><div className="empty-state">Nenhum usuário cadastrado no banco de dados.</div></div>}</div>
    </div>
  )
}
