import { useEffect, useState } from 'react'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [novo, setNovo] = useState({
    nome: '',
    email: '',
    papel: 'Atendente',
  })

  // 1. Carrega a lista de usuários do backend
  useEffect(() => {
    async function fetchUsuarios() {
      try {
        setLoading(true)
        const response = await fetch('/api/usuarios')

        if (response.ok) {
          const data = await response.json()
          setUsuarios(Array.isArray(data) ? data : [])
        } else {
          console.warn(`API /api/usuarios retornou status ${response.status}. Usando lista vazia.`)
          setUsuarios([])
        }
      } catch (err) {
        console.warn('Erro de rede ou backend off-line ao buscar usuários:', err)
        setUsuarios([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [])

  // 2. Alterna o acesso do usuário (PATCH com atualização otimista)
  const toggleAtivo = async (id, statusAtual) => {
    const novoStatus = !statusAtual

    // Atualização otimista no estado local
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ativo: novoStatus } : u))
    )

    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: novoStatus }),
      })

      if (!response.ok) {
        throw new Error('Falha ao atualizar acesso do usuário no servidor.')
      }
    } catch (err) {
      console.error(err)
      // Reverte em caso de erro no servidor
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ativo: statusAtual } : u))
      )
    }
  }

  // 3. Cadastra/Convida novo usuário (POST /api/usuarios)
  const salvar = async (e) => {
    e.preventDefault()
    if (!novo.nome.trim() || !novo.email.trim()) return

    setSubmitting(true)

    const payload = {
      nome: novo.nome.trim(),
      email: novo.email.trim(),
      papel: novo.papel,
      ativo: true,
    }

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const usuarioCriado = await response.json()
        setUsuarios((prev) => [...prev, usuarioCriado])
      } else {
        // Fallback local se a API não estiver pronta
        setUsuarios((prev) => [...prev, { ...payload, id: Date.now() }])
      }

      setNovo({ nome: '', email: '', papel: 'Atendente' })
      setShowForm(false)
    } catch (err) {
      console.warn('Backend off-line. Adicionando usuário localmente.')
      setUsuarios((prev) => [...prev, { ...payload, id: Date.now() }])
      setNovo({ nome: '', email: '', papel: 'Atendente' })
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading">Carregando usuários do painel...</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Usuários do painel</h2>
          <div className="muted">Quem tem acesso e com qual função</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Fechar formulário' : '+ Convidar usuário'}
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ padding: 18, marginBottom: 18 }} onSubmit={salvar}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="field">
              <label>Nome completo</label>
              <input
                value={novo.nome}
                onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                placeholder="Ex: Maria Silva"
                required
                disabled={submitting}
              />
            </div>

            <div className="field">
              <label>E-mail</label>
              <input
                type="email"
                value={novo.email}
                onChange={(e) => setNovo({ ...novo, email: e.target.value })}
                placeholder="maria@empresa.com"
                required
                disabled={submitting}
              />
            </div>

            <div className="field">
              <label>Função / Papel</label>
              <select
                value={novo.papel}
                onChange={(e) => setNovo({ ...novo, papel: e.target.value })}
                disabled={submitting}
                style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6 }}
              >
                <option value="Administrador">Administrador</option>
                <option value="Gerente">Gerente</option>
                <option value="Atendente">Atendente</option>
                <option value="Cozinha">Cozinha</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Enviando convite...' : 'Enviar convite'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Função</th>
              <th>E-mail</th>
              <th>Acesso ativo</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, index) => {
              const estaAtivo = Boolean(u.ativo ?? u.status_ativo)
              const funcao = u.papel || u.funcao || 'Atendente'

              return (
                <tr key={u.id || index}>
                  <td style={{ fontWeight: 700 }}>{u.nome}</td>
                  <td>
                    <span className="pill pill-sky">{funcao}</span>
                  </td>
                  <td style={{ color: '#6B675F' }}>{u.email}</td>
                  <td>
                    <button
                      className={`toggle ${estaAtivo ? 'on' : ''}`}
                      onClick={() => toggleAtivo(u.id, estaAtivo)}
                      title="Ativar/desativar acesso do usuário"
                    >
                      <span className="knob" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <div className="empty-state">Nenhum usuário cadastrado no banco de dados.</div>
          </div>
        )}
      </div>
    </div>
  )
}