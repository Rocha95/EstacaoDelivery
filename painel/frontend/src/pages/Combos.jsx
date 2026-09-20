import { useEffect, useState } from 'react'

const FORM_VAZIO = { id: '', nome: '', itensText: '', preco: '', imagemUrl: '', arquivoImagem: null, removerImagem: false }

function normalizarNome(valor = '') {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
}

function parseItens(texto, produtos) {
  const partes = String(texto || '').split(',').map((i) => i.trim()).filter(Boolean)
  if (!partes.length) throw new Error('Informe ao menos um produto no combo.')

  return partes.map((textoItem) => {
    const match = textoItem.match(/^(\d+)\s*x?\s+(.+)$/i)
    const quantidade = match ? Number(match[1]) : 1
    const nome = (match ? match[2] : textoItem).trim()
    const produto = produtos.find((p) => normalizarNome(p.nome) === normalizarNome(nome))
    if (!produto) throw new Error(`Produto não encontrado: ${nome}`)
    if (!Number.isInteger(quantidade) || quantidade < 1) throw new Error(`Quantidade inválida para: ${nome}`)
    return { produtoId: produto.id, quantidade }
  })
}

function itensParaTexto(itens = []) {
  return itens.map((item) => `${item.quantidade || 1}x ${item.produto?.nome || item.nome || item.descricao || ''}`.trim()).filter(Boolean).join(', ')
}

export default function Combos() {
  const [combos, setCombos] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [novo, setNovo] = useState(FORM_VAZIO)
  const [imagePreview, setImagePreview] = useState('')

  const carregar = async () => {
    const [produtosResponse, combosResponse] = await Promise.all([fetch('/api/produtos'), fetch('/api/combos')])
    if (produtosResponse.ok) setProdutos(await produtosResponse.json())
    if (!combosResponse.ok) throw new Error('Não foi possível carregar os combos.')
    setCombos(await combosResponse.json())
  }

  useEffect(() => {
    carregar().catch(() => setCombos([])).finally(() => setLoading(false))
  }, [])

  const resetForm = () => {
    setNovo({ ...FORM_VAZIO })
    setImagePreview('')
    setShowForm(false)
  }

  const editar = (combo) => {
    setNovo({
      id: combo.id,
      nome: combo.nome || '',
      itensText: itensParaTexto(combo.itens),
      preco: combo.preco ?? '',
      imagemUrl: combo.imagemUrl || '',
      arquivoImagem: null,
      removerImagem: false,
    })
    setImagePreview(combo.imagemUrl || '')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleImageUrl = (e) => {
    const valor = e.target.value
    setNovo((prev) => ({
      ...prev,
      imagemUrl: valor,
      arquivoImagem: null,
      removerImagem: false,
    }))
    setImagePreview(valor)
  }

  const handleImageFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNovo((prev) => ({ ...prev, arquivoImagem: file, imagemUrl: '', removerImagem: false }))
    setImagePreview(URL.createObjectURL(file))
  }

  const removerFoto = () => {
    setImagePreview('')
    setNovo((prev) => ({ ...prev, imagemUrl: '', arquivoImagem: null, removerImagem: Boolean(prev.id) }))
  }

  const toggleAtivo = async (id, statusAtual) => {
    setCombos((prev) => prev.map((c) => c.id === id ? { ...c, ativo: !statusAtual } : c))
    try {
      const response = await fetch(`/api/combos/${id}/ativo`, { method: 'PATCH' })
      if (!response.ok) throw new Error()
    } catch {
      setCombos((prev) => prev.map((c) => c.id === id ? { ...c, ativo: statusAtual } : c))
      alert('Não foi possível atualizar o combo.')
    }
  }

  const salvar = async (e) => {
    e.preventDefault()
    if (!novo.nome.trim() || !novo.preco) return
    setSubmitting(true)

    try {
      const itens = parseItens(novo.itensText, produtos)
      const formData = new FormData()
      formData.append('nome', novo.nome.trim())
      formData.append('preco', String(parseFloat(novo.preco) || 0))
      formData.append('itens', JSON.stringify(itens))
      if (novo.arquivoImagem) formData.append('imagem', novo.arquivoImagem)
      else if (novo.imagemUrl) formData.append('imagemUrl', novo.imagemUrl)
      else if (novo.id && novo.removerImagem) formData.append('removerImagem', 'true')

      const url = novo.id ? `/api/combos/${novo.id}` : '/api/combos'
      const method = novo.id ? 'PATCH' : 'POST'
      const response = await fetch(url, { method, body: formData })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.erro || data.message || 'Não foi possível salvar o combo.')

      setCombos((prev) => novo.id ? prev.map((c) => c.id === data.id ? data : c) : [...prev, data])
      resetForm()
    } catch (err) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const formatarItens = (itens) => Array.isArray(itens) ? itens.map((item) => typeof item === 'object' && item !== null ? `${item.quantidade || 1}x ${item.produto?.nome || item.nome || item.descricao || ''}` : item) : []

  if (loading) return <div className="loading">Carregando combos...</div>

  return (
    <div>
      <div className="section-head">
        <div><h2>Combos</h2><div className="muted">Agrupamentos de produtos com preço promocional</div></div>
        <button className="btn btn-primary" onClick={() => { if (showForm) resetForm(); else { setNovo({ ...FORM_VAZIO }); setImagePreview(''); setShowForm(true) } }}>{showForm ? 'Fechar formulário' : '+ Novo combo'}</button>
      </div>

      {showForm && <form className="card" style={{ padding: 18, marginBottom: 18 }} onSubmit={salvar}>
        <div className="form-grid">
          <div className="field"><label>Nome do combo</label><input value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} placeholder="Ex: Combo Casal" required disabled={submitting} /></div>
          <div className="field"><label>Itens inclusos (separados por vírgula)</label><input value={novo.itensText} onChange={(e) => setNovo({ ...novo, itensText: e.target.value })} placeholder="Ex: 2x Burger, 1x Batata" disabled={submitting} /></div>
          <div className="field"><label>Preço promocional (R$)</label><input type="number" step="0.01" min="0" value={novo.preco} onChange={(e) => setNovo({ ...novo, preco: e.target.value })} placeholder="0,00" required disabled={submitting} /></div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label>Foto do combo</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="file" accept="image/*" onChange={handleImageFile} disabled={submitting} style={{ fontSize: 13 }} />
            <span style={{ fontSize: 12, color: '#8A867C' }}>ou colar URL:</span>
            <input type="url" placeholder="https://exemplo.com/combo.jpg" value={novo.imagemUrl} disabled={submitting} onChange={handleImageUrl} style={{ flex: 1, minWidth: 220 }} />
          </div>
          {imagePreview && <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}><img src={imagePreview} alt="Preview do combo" style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 8 }} /><button type="button" className="btn btn-ghost" onClick={removerFoto} disabled={submitting}>Remover foto</button></div>}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Salvando...' : novo.id ? 'Salvar alterações' : 'Salvar combo'}</button><button type="button" className="btn btn-ghost" onClick={resetForm} disabled={submitting}>Cancelar</button></div>
      </form>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {combos.map((c, index) => {
          const precoNum = Number(c?.preco) || 0, economizaNum = Number(c?.economiza) || 0, estaAtivo = Boolean(c?.ativo), listaItens = formatarItens(c?.itens)
          return <div className="card" key={c.id || index} style={{ padding: 16 }}>
            {c.imagemUrl && <img src={c.imagemUrl} alt={c.nome} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 10 }}><div style={{ fontWeight: 800, fontSize: 14.5 }}>{c.nome}</div><button className={`toggle ${estaAtivo ? 'on' : ''}`} onClick={() => toggleAtivo(c.id, estaAtivo)} title="Ativar/inativar combo"><span className="knob" /></button></div>
            <ul style={{ margin: '10px 0', paddingLeft: 18, color: '#6B675F', fontSize: 13 }}>{listaItens.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, gap: 10 }}><span className="money" style={{ fontSize: 16 }}>R$ {precoNum.toFixed(2)}</span>{economizaNum > 0 && <span className="pill pill-basil">economiza R$ {economizaNum.toFixed(2)}</span>}</div>
            <button className="btn btn-ghost" style={{ width: '100%', marginTop: 12 }} onClick={() => editar(c)}>Editar</button>
          </div>
        })}
      </div>
      {combos.length === 0 && <div className="card" style={{ padding: 24, textAlign: 'center' }}><div className="empty-state">Nenhum combo cadastrado no banco de dados.</div></div>}
    </div>
  )
}
