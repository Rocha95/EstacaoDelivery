import { useEffect, useState } from 'react'
import { imagemPublica } from '../utils/imagem'

const FORM_VAZIO = { id: null, nome: '', preco: '', categoriaId: '', imagemUrl: '', arquivoImagem: null }

export default function Adicionais() {
  const [adicionais, setAdicionais] = useState([])
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const carregar = async () => {
    const [rAdicionais, rCategorias] = await Promise.all([
      fetch('/api/adicionais'),
      fetch('/api/categorias'),
    ])
    if (!rAdicionais.ok) throw new Error('Não foi possível carregar os adicionais.')
    if (!rCategorias.ok) throw new Error('Não foi possível carregar as categorias.')
    setAdicionais(await rAdicionais.json())
    setCategorias(await rCategorias.json())
  }

  useEffect(() => {
    carregar().catch((err) => console.warn(err)).finally(() => setLoading(false))
  }, [])

  const resetForm = () => {
    setForm(FORM_VAZIO)
    setImagePreview('')
  }

  const editar = (item) => {
    setForm({
      id: item.id,
      nome: item.nome || '',
      preco: item.preco != null ? Number(item.preco).toFixed(2) : '',
      categoriaId: item.categoriaId || '',
      imagemUrl: item.imagemUrl || '',
      arquivoImagem: null,
    })
    setImagePreview(item.imagemUrl || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleImageFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm((prev) => ({ ...prev, arquivoImagem: file, imagemUrl: '' }))
    setImagePreview(URL.createObjectURL(file))
  }

  const toggleAtivo = async (id, statusAtual) => {
    setAdicionais((prev) => prev.map((a) => (a.id === id ? { ...a, ativo: !statusAtual } : a)))
    try {
      const response = await fetch(`/api/adicionais/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !statusAtual }),
      })
      if (!response.ok) throw new Error()
    } catch {
      setAdicionais((prev) => prev.map((a) => (a.id === id ? { ...a, ativo: statusAtual } : a)))
      alert('Não foi possível atualizar o adicional.')
    }
  }

  const salvar = async (e) => {
    e.preventDefault()
    if (!form.nome.trim() || !form.categoriaId) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('nome', form.nome.trim())
      formData.append('categoriaId', form.categoriaId)
      formData.append('preco', String(parseFloat(form.preco) || 0))
      if (form.arquivoImagem) formData.append('imagem', form.arquivoImagem)
      else if (form.imagemUrl) formData.append('imagemUrl', form.imagemUrl)

      const url = form.id ? `/api/adicionais/${form.id}` : '/api/adicionais'
      const response = await fetch(url, { method: form.id ? 'PATCH' : 'POST', body: formData })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.erro || data.message || 'Não foi possível salvar o adicional.')

      if (form.id) setAdicionais((prev) => prev.map((a) => (a.id === form.id ? data : a)))
      else setAdicionais((prev) => [...prev, data])
      resetForm()
    } catch (err) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const categoriasMap = new Map(categorias.map((categoria) => [categoria.id, categoria.nome]))
  const categoriasComAdicionais = categorias.filter((categoria) => adicionais.some((a) => a.categoriaId === categoria.id))
  const adicionaisSemCategoria = adicionais.filter((a) => !a.categoriaId)

  if (loading) return <div className="loading">Carregando adicionais...</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Adicionais</h2>
          <div className="muted">Os adicionais usam as mesmas categorias dos produtos.</div>
        </div>
      </div>

      <form className="card" style={{ padding: 16, marginBottom: 20 }} onSubmit={salvar}>
        <div style={{ fontWeight: 800, marginBottom: 14 }}>{form.id ? 'Editar adicional' : 'Novo adicional'}</div>
        <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr auto' }}>
          <div className="field">
            <label>Nome do adicional</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Cheddar extra" disabled={submitting} required />
          </div>
          <div className="field">
            <label>Categoria</label>
            <select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })} disabled={submitting} required>
              <option value="">Selecione uma categoria...</option>
              {categorias.filter((categoria) => categoria.ativa !== false).map((categoria) => (
                <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Preço (R$)</label>
            <input type="number" step="0.01" min="0" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} placeholder="0,00" disabled={submitting} />
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={submitting || !form.nome.trim() || !form.categoriaId}>{submitting ? 'Salvando...' : form.id ? 'Salvar alterações' : 'Adicionar'}</button>
            {form.id && <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={submitting}>Cancelar</button>}
          </div>
        </div>

        <div className="field" style={{ marginTop: 4 }}>
          <label>Foto do adicional</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="file" accept="image/*" onChange={handleImageFile} disabled={submitting} style={{ fontSize: 13 }} />
            <span style={{ fontSize: 12, color: '#8A867C' }}>ou colar URL:</span>
            <input type="url" placeholder="https://exemplo.com/imagem.jpg" value={form.imagemUrl} disabled={submitting} onChange={(e) => { setForm({ ...form, imagemUrl: e.target.value, arquivoImagem: null }); setImagePreview(e.target.value) }} style={{ flex: 1, minWidth: 220 }} />
          </div>
          {imagePreview && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={imagemPublica(imagePreview)} alt="Preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, color: '#d9534f' }} onClick={() => { setImagePreview(''); setForm({ ...form, imagemUrl: '', arquivoImagem: null }) }}>Remover foto</button>
            </div>
          )}
        </div>
      </form>

      {categoriasComAdicionais.map((categoria) => {
        const itensDoGrupo = adicionais.filter((a) => a.categoriaId === categoria.id)
        return (
          <div key={categoria.id} style={{ marginBottom: 20 }}>
            <div className="section-head" style={{ marginBottom: 8 }}><h2 style={{ fontSize: 13, color: '#8A867C' }}>{categoria.nome}</h2></div>
            <div className="card">
              <table className="data-table"><tbody>
                {itensDoGrupo.map((a) => {
                  const precoNum = Number(a.preco) || 0
                  const estaAtivo = Boolean(a.ativo)
                  return (
                    <tr key={a.id}>
                      <td style={{ width: 46 }}>{a.imagemUrl ? <img src={imagemPublica(a.imagemUrl)} alt={a.nome} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} /> : <div style={{ width: 36, height: 36, borderRadius: 6, background: '#F0EFEA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A09D94', fontSize: 15 }}>➕</div>}</td>
                      <td style={{ fontWeight: 600 }}>{a.nome}</td>
                      <td className="money">{precoNum > 0 ? `+ R$ ${precoNum.toFixed(2)}` : 'Sem custo'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                          <button type="button" className="btn btn-ghost" onClick={() => editar(a)}>Editar</button>
                          <button type="button" className={`toggle ${estaAtivo ? 'on' : ''}`} onClick={() => toggleAtivo(a.id, estaAtivo)} title="Ativar/inativar adicional"><span className="knob" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody></table>
            </div>
          </div>
        )
      })}

      {adicionaisSemCategoria.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <strong>Adicionais sem categoria</strong>
          <div className="muted" style={{ marginTop: 6 }}>Esses registros são legados e não aparecerão automaticamente nos produtos. Edite-os e selecione uma categoria.</div>
          <div style={{ marginTop: 12 }}>{adicionaisSemCategoria.map((a) => <button key={a.id} type="button" className="btn btn-ghost" style={{ marginRight: 8, marginBottom: 8 }} onClick={() => editar(a)}>{a.nome} — Editar</button>)}</div>
        </div>
      )}

      {adicionais.length === 0 && <div className="card" style={{ padding: 24, textAlign: 'center' }}><div className="empty-state">Nenhum adicional cadastrado no banco de dados.</div></div>}
    </div>
  )
}
