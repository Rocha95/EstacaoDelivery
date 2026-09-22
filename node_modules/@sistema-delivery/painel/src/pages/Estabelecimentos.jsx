import { useEffect, useState } from 'react'

export default function Estabelecimentos() {
  const [items, setItems] = useState([])
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const selecionado = localStorage.getItem('estabelecimentoId') || 'default'

  const carregar = async () => {
    try {
      setErro('')
      const response = await fetch('/api/estabelecimentos')
      const data = await response.json().catch(() => [])
      if (!response.ok) throw new Error(data?.erro || data?.message || 'Não foi possível carregar as lojas.')
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setErro(err.message || 'Não foi possível carregar as lojas.')
    }
  }

  useEffect(() => { carregar() }, [])

  const criar = async (event) => {
    event.preventDefault()
    if (!nome.trim() || !slug.trim()) return
    try {
      setSalvando(true)
      setErro('')
      const response = await fetch('/api/estabelecimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, slug }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.erro || data?.message || 'Não foi possível criar a loja.')
      setNome('')
      setSlug('')
      await carregar()
    } catch (err) {
      setErro(err.message || 'Não foi possível criar a loja.')
    } finally {
      setSalvando(false)
    }
  }

  const selecionar = (id) => {
    localStorage.setItem('estabelecimentoId', id)
    window.location.reload()
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Lojas e unidades</h2>
          <div className="muted">Cadastre e escolha qual loja você está administrando.</div>
        </div>
      </div>

      {erro && <div className="card" style={{ color: '#b42318', marginBottom: 14 }}>{erro}</div>}

      <div className="card">
        <h3 style={{ margin: '0 0 4px' }}>Adicionar uma loja</h3>
        <div className="muted" style={{ marginBottom: 14 }}>
          Use esta opção para cadastrar outra unidade ou operação no mesmo sistema.
        </div>
        <form onSubmit={criar}>
          <div className="form-grid">
            <div className="field">
              <label>Nome da loja</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Estação Delivery Centro" required />
            </div>
            <div className="field">
              <label>Identificador da loja</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Ex.: centro" required />
              <div className="muted" style={{ marginTop: 5 }}>Usado internamente para identificar esta loja. Não precisa ser o nome comercial.</div>
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 12 }} disabled={salvando}>
            {salvando ? 'Cadastrando...' : 'Cadastrar loja'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 4 }}>Minhas lojas</h3>
        <div className="muted" style={{ marginBottom: 10 }}>Escolha em qual loja você deseja trabalhar neste momento.</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {items.map((item) => {
            const ativa = item.id === selecionado
            return (
              <div className="card" key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div>
                  <strong>{item.nome}</strong>
                  <div className="muted">Identificador: {item.slug}</div>
                  <div className="muted">Status: {item.ativo ? 'Ativa' : 'Inativa'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {ativa && <span className="pill pill-basil">Loja atual</span>}
                  <button className="btn btn-ghost" disabled={!item.ativo || ativa} onClick={() => selecionar(item.id)}>
                    {ativa ? 'Selecionada' : 'Administrar esta loja'}
                  </button>
                </div>
              </div>
            )
          })}
          {!items.length && <div className="card empty-state">Nenhuma loja cadastrada.</div>}
        </div>
      </div>
    </div>
  )
}
