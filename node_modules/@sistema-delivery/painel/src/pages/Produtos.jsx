import { useEffect, useState } from 'react'

export default function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editandoId, setEditandoId] = useState(null)

  // Estado para controlar o filtro por categoria
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS')

  const initialFormState = {
    nome: '',
    descricao: '',
    categoriaId: '',
    preco: '',
    disponibilidadeInicio: '11:00',
    disponibilidadeFim: '23:00',
    imagemUrl: '',
    arquivoImagem: null,
  }

  const [novo, setNovo] = useState(initialFormState)
  const [imagePreview, setImagePreview] = useState('')

  // 1. Carrega Produtos e Categorias da API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const [resProdutos, resCategorias] = await Promise.all([
          fetch('/api/produtos'),
          fetch('/api/categorias').catch(() => null),
        ])

        if (!resProdutos.ok) throw new Error('Erro ao carregar lista de produtos')

        const dataProdutos = await resProdutos.json()
        const dataCategorias = resCategorias && resCategorias.ok ? await resCategorias.json() : []

        const prodsArray = Array.isArray(dataProdutos) ? dataProdutos : []
        const catsArray = Array.isArray(dataCategorias) ? dataCategorias : []

        setProdutos(prodsArray)
        setCategorias(catsArray)

        if (catsArray.length > 0) {
          const primeiraCatId = typeof catsArray[0] === 'object' ? catsArray[0].id : catsArray[0]
          setNovo((prev) => ({ ...prev, categoriaId: primeiraCatId }))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Limpa o formulário e reseta estados de edição
  const limparFormulario = () => {
    const primeiraCatId = categorias.length > 0 ? (typeof categorias[0] === 'object' ? categorias[0].id : categorias[0]) : ''
    setNovo({
      ...initialFormState,
      categoriaId: primeiraCatId
    })
    setImagePreview('')
    setEditandoId(null)
    setShowForm(false)
  }

  // Prepara o formulário para edição com os dados do produto selecionado
  const prepararEdicao = (p) => {
    const catId = typeof p.categoria === 'object' && p.categoria !== null ? p.categoria.id : (p.categoriaId || p.categoria)
    const foto = p.imagem || p.fotoUrl || p.foto || p.imagemUrl || ''

    setNovo({
      nome: p.nome || '',
      descricao: p.descricao || p.detalhes || '',
      categoriaId: catId || '',
      preco: p.preco ? String(p.preco) : '',
      disponibilidadeInicio: p.disponibilidadeInicio || '11:00',
      disponibilidadeFim: p.disponibilidadeFim || '23:00',
      imagemUrl: typeof foto === 'string' && foto.startsWith('http') ? foto : '',
      arquivoImagem: null,
    })

    setImagePreview(foto)
    setEditandoId(p.id)
    setShowForm(true)
  }

  // Manipula seleção de arquivo de imagem local
  const handleImageFile = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNovo((prev) => ({ ...prev, arquivoImagem: file, imagemUrl: '' }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // 2. Alternar status ativo/inativo
  const toggleAtivo = async (id, statusAtual) => {
    const novoStatus = !statusAtual

    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ativo: novoStatus } : p))
    )

    try {
      const response = await fetch(`/api/produtos/${id}/ativo`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Falha ao atualizar o status no servidor')
      }
    } catch (err) {
      alert('Erro ao atualizar produto no servidor. Tente novamente.')
      setProdutos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ativo: statusAtual } : p))
      )
    }
  }

  // 3. Salvar produto (Criação ou Edição)
  const salvar = async (e) => {
    e.preventDefault()
    if (!novo.nome || !novo.preco || !novo.categoriaId) return

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('nome', novo.nome)
      formData.append('descricao', novo.descricao)
      formData.append('categoriaId', novo.categoriaId)
      formData.append('preco', parseFloat(novo.preco) || 0)
      formData.append('disponibilidadeInicio', novo.disponibilidadeInicio)
      formData.append('disponibilidadeFim', novo.disponibilidadeFim)

      if (!editandoId) {
        formData.append('ativo', 'true')
      }

      if (novo.arquivoImagem) {
        formData.append('imagem', novo.arquivoImagem)
      } else if (novo.imagemUrl) {
        formData.append('imagemUrl', novo.imagemUrl)
      }

      const url = editandoId ? `/api/produtos/${editandoId}` : '/api/produtos'
      const method = editandoId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.erro || errData.message || 'Falha ao salvar o produto no servidor')
      }

      const produtoSalvo = await response.json()

      if (editandoId) {
        setProdutos((prev) => prev.map((p) => (p.id === editandoId ? { ...p, ...produtoSalvo } : p)))
      } else {
        setProdutos((prev) => [...prev, produtoSalvo])
      }

      limparFormulario()
    } catch (err) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const formatCategoria = (cat) => {
    if (typeof cat === 'object' && cat !== null) return cat.nome || 'Geral'
    return cat || 'Geral'
  }

  const formatAdicionais = (adicionais) => {
    if (Array.isArray(adicionais) && adicionais.length > 0) {
      return adicionais
        .map((a) => (typeof a === 'object' && a !== null ? a.nome || a.descricao : a))
        .join(', ')
    }
    return '—'
  }

  // Filtragem dos produtos pela categoria selecionada
  const produtosFiltrados = produtos.filter((p) => {
    if (categoriaFiltro === 'TODAS') return true

    const prodCatId = typeof p.categoria === 'object' && p.categoria !== null ? p.categoria.id : (p.categoriaId || p.categoria)
    return String(prodCatId) === String(categoriaFiltro)
  })

  if (loading) return <div className="loading">Carregando produtos...</div>
  if (error) return <div className="error-message">Erro: {error}</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Produtos do cardápio</h2>
          <div className="muted">
            {produtosFiltrados.length} de {produtos.length} produto(s) exibido(s)
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (showForm) {
              limparFormulario()
            } else {
              setShowForm(true)
            }
          }}
        >
          {showForm ? 'Fechar formulário' : '+ Novo produto'}
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ padding: 18, marginBottom: 18 }} onSubmit={salvar}>
          <h3>{editandoId ? 'Editar produto' : 'Novo produto'}</h3>

          <div className="form-grid" style={{ marginTop: 12 }}>
            <div className="field">
              <label>Nome do produto</label>
              <input
                value={novo.nome}
                onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                placeholder="Ex: X-Burguer Especial"
                required
              />
            </div>

            <div className="field">
              <label>Categoria</label>
              {categorias.length > 0 ? (
                <select
                  value={novo.categoriaId}
                  onChange={(e) => setNovo({ ...novo, categoriaId: e.target.value })}
                  required
                >
                  {categorias.map((c, idx) => {
                    const id = typeof c === 'object' ? c.id : c
                    const nome = typeof c === 'object' ? c.nome : c
                    return (
                      <option key={id || idx} value={id}>
                        {nome}
                      </option>
                    )
                  })}
                </select>
              ) : (
                <div style={{ fontSize: 12, color: '#8A867C' }}>
                  Cadastre uma categoria antes de criar produtos.
                </div>
              )}
            </div>

            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Descrição do produto (exibida no App)</label>
              <textarea
                rows={2}
                value={novo.descricao}
                onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
                placeholder="Ex: Pão brioche, hambúrguer bovino de 180g, queijo cheddar e maionese especial da casa."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--line, #ccc)',
                  fontSize: 14,
                  resize: 'vertical',
                }}
              />
            </div>

            <div className="field">
              <label>Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={novo.preco}
                onChange={(e) => setNovo({ ...novo, preco: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>

            <div className="field">
              <label>Disponível de / até</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="time"
                  value={novo.disponibilidadeInicio}
                  onChange={(e) => setNovo({ ...novo, disponibilidadeInicio: e.target.value })}
                />
                <input
                  type="time"
                  value={novo.disponibilidadeFim}
                  onChange={(e) => setNovo({ ...novo, disponibilidadeFim: e.target.value })}
                />
              </div>
            </div>

            {/* Campo para Foto do Produto */}
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Foto do produto</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  style={{ fontSize: 13 }}
                />
                <span style={{ fontSize: 12, color: '#8A867C' }}>ou colar URL:</span>
                <input
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={novo.imagemUrl}
                  onChange={(e) => {
                    setNovo({ ...novo, imagemUrl: e.target.value, arquivoImagem: null })
                    setImagePreview(e.target.value)
                  }}
                  style={{ flex: 1 }}
                />
              </div>

              {imagePreview && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: 12, color: '#d9534f' }}
                    onClick={() => {
                      setImagePreview('')
                      setNovo({ ...novo, imagemUrl: '', arquivoImagem: null })
                    }}
                  >
                    Remover foto
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : editandoId ? 'Atualizar produto' : 'Salvar produto'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={limparFormulario}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filtro de categorias */}
      <div className="card" style={{ padding: '12px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ fontWeight: 600, fontSize: 14 }}>Filtrar por Categoria:</label>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--line, #ccc)', fontSize: 14, minWidth: 200 }}
        >
          <option value="TODAS">Todas as categorias</option>
          {categorias.map((c, idx) => {
            const id = typeof c === 'object' ? c.id : c
            const nome = typeof c === 'object' ? c.nome : c
            return (
              <option key={id || idx} value={id}>
                {nome}
              </option>
            )
          })}
        </select>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>Foto</th>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Disponibilidade</th>
              <th>Adicionais vinculados</th>
              <th>Ativo p/ delivery</th>
              <th style={{ width: 80 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.map((p) => {
              const precoNum = Number(p?.preco) || 0
              const estaAtivo = Boolean(p?.ativo)
              const fotoUrl = p?.imagem || p?.fotoUrl || p?.foto || p?.imagemUrl
              const descricaoTexto = p?.descricao || p?.detalhes || ''

              return (
                <tr key={p.id}>
                  <td>
                    {fotoUrl ? (
                      <img
                        src={fotoUrl}
                        alt={p.nome}
                        style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 6 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 6,
                          background: '#F0EFEA',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#A09D94',
                          fontSize: 18,
                        }}
                      >
                        🍔
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.nome}</div>
                    {descricaoTexto && (
                      <div style={{ fontSize: 12, color: '#8A867C', marginTop: 2, maxWidth: 300 }}>
                        {descricaoTexto}
                      </div>
                    )}
                  </td>
                  <td>{formatCategoria(p.categoria)}</td>
                  <td className="money">R$ {precoNum.toFixed(2)}</td>
                  <td>
                    {p.disponibilidadeInicio || '11:00'} – {p.disponibilidadeFim || '23:00'}
                  </td>
                  <td style={{ color: '#6B675F' }}>{formatAdicionais(p.adicionais)}</td>
                  <td>
                    <button
                      className={`toggle ${estaAtivo ? 'on' : ''}`}
                      onClick={() => toggleAtivo(p.id, estaAtivo)}
                      title="Ativar/inativar disponibilidade"
                    >
                      <span className="knob" />
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '4px 8px', fontSize: 13 }}
                      onClick={() => prepararEdicao(p)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              )
            })}
            {produtosFiltrados.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    {produtos.length === 0
                      ? 'Nenhum produto cadastrado no banco de dados.'
                      : 'Nenhum produto encontrado para a categoria selecionada.'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}