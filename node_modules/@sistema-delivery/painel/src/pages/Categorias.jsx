import { useEffect, useState } from 'react'

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // 1. Carrega as categorias da API
  useEffect(() => {
    async function fetchCategorias() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/categorias')
        if (!response.ok) {
          throw new Error('Erro ao carregar categorias do servidor')
        }

        const data = await response.json()
        setCategorias(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCategorias()
  }, [])

  // 2. Adiciona nova categoria (POST /api/categorias)
  const adicionar = async (e) => {
    e.preventDefault()
    if (!nome.trim()) return

    setSubmitting(true)

    const payload = {
      nome: nome.trim(),
      ordem: categorias.length + 1,
    }

    try {
      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Falha ao adicionar categoria no servidor')
      }

      const novaCategoria = await response.json()

      // Adiciona no estado local com o ID retornado pelo banco
      setCategorias((prev) => [...prev, novaCategoria || { ...payload, id: Date.now(), produtos: 0 }])
      setNome('')
    } catch (err) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  // 3. Remove uma categoria (DELETE /api/categorias/:id)
  const remover = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover esta categoria?')) return

    // Atualização otimista do estado
    const categoriasAnteriores = [...categorias]
    setCategorias((prev) => prev.filter((c) => c.id !== id))

    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar categoria no servidor')
      }
    } catch (err) {
      alert('Não foi possível remover a categoria. Tente novamente.')
      // Reverte o estado em caso de falha
      setCategorias(categoriasAnteriores)
    }
  }

  if (loading) return <div className="loading">Carregando categorias...</div>
  if (error) return <div className="error-message">Erro: {error}</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Categorias do cardápio</h2>
          <div className="muted">Organize como os produtos aparecem para o cliente</div>
        </div>
      </div>

      <form className="card" style={{ padding: 16, marginBottom: 18, display: 'flex', gap: 10 }} onSubmit={adicionar}>
        <input
          className="field"
          style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13 }}
          placeholder="Nome da nova categoria (ex: Massas)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={submitting}
        />
        <button className="btn btn-primary" type="submit" disabled={submitting || !nome.trim()}>
          {submitting ? 'Adicionando...' : 'Adicionar categoria'}
        </button>
      </form>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ordem</th>
              <th>Categoria</th>
              <th>Produtos vinculados</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c, index) => {
              const numProdutos = Array.isArray(c.produtos)
                ? c.produtos.length
                : typeof c.produtos === 'number'
                ? c.produtos
                : c._count?.produtos || 0

              return (
                <tr key={c.id || index}>
                  <td className="order-id">{c.ordem || index + 1}</td>
                  <td style={{ fontWeight: 700 }}>{c.nome}</td>
                  <td>{numProdutos}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => remover(c.id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              )
            })}
            {categorias.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">Nenhuma categoria cadastrada no banco de dados.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}