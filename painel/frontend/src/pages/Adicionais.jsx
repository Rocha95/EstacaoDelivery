import { useEffect, useState } from 'react'

const FORM_VAZIO = { id: null, nome: '', preco: '', grupoId: '', imagemUrl: '', arquivoImagem: null }

export default function Adicionais() {
  const [adicionais, setAdicionais] = useState([])
  const [grupos, setGrupos] = useState([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const carregar = async () => {
    const [rAdicionais, rGrupos] = await Promise.all([fetch('/api/adicionais'), fetch('/api/adicionais/grupos')])
    if (!rAdicionais.ok) throw new Error('Não foi possível carregar os adicionais.')
    if (!rGrupos.ok) throw new Error('Não foi possível carregar os grupos.')
    setAdicionais(await rAdicionais.json())
    setGrupos(await rGrupos.json())
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
      grupoId: item.grupoId || '',
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
    if (!form.nome.trim() || !form.grupoId) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('nome', form.nome.trim())
      formData.append('grupoId', form.grupoId)
      formData.append('preco', String(parseFloat(form.preco) || 0))
      if (form.arquivoImagem) formData.append('imagem', form.arquivoImagem)
      else if (form.imagemUrl) formData.append('imagemUrl', form.imagemUrl)

      const url = form.id ? `/api/adicionais/${form.id}` : '/api/adicionais'
      const response = await fetch(url, { method: form.id ? 'PATCH' : 'POST', body: formData })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.erro || 'Não foi possível salvar o adicional.')

      if (form.id) setAdicionais((prev) => prev.map((a) => (a.id === form.id ? data : a)))
      else setAdicionais((prev) => [...prev, data])
      resetForm()
    } catch (err) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const gruposPorNome = [...new Set(adicionais.map((a) => a.grupo || 'Outros'))]

  if (loading) return <div className="loading">Carregando adicionais...</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Adicionais</h2>
          <div className="muted">Itens extras que o cliente pode incluir nos pedidos</div>
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
            <label>Grupo de adicionais</label>
            <select value={form.grupoId} onChange={(e) => setForm({ ...form, grupoId: e.target.value })} disabled={submitting} required>
              <option value="">Selecione um grupo...</option>
              {grupos.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Preço (R$)</label>
            <input type="number" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} placeholder="0,00" disabled={submitting} />
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={submitting || !form.nome.trim() || !form.grupoId}>{submitting ? 'Salvando...' : form.id ? 'Salvar alterações' : 'Adicionar'}</button>
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
              <img src={imagePreview} alt="Preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, color: '#d9534f' }} onClick={() => { setImagePreview(''); setForm({ ...form, imagemUrl: '', arquivoImagem: null }) }}>Remover foto</button>
            </div>
          )}
        </div>
      </form>

      {gruposPorNome.map((grupo) => {
        const itensDoGrupo = adicionais.filter((a) => (a.grupo || 'Outros') === grupo)
        return (
          <div key={grupo} style={{ marginBottom: 20 }}>
            <div className="section-head" style={{ marginBottom: 8 }}><h2 style={{ fontSize: 13, color: '#8A867C' }}>{grupo}</h2></div>
            <div className="card">
              <table className="data-table"><tbody>
                {itensDoGrupo.map((a) => {
                  const precoNum = Number(a.preco) || 0
                  const estaAtivo = Boolean(a.ativo)
                  return (
                    <tr key={a.id}>
                      <td style={{ width: 46 }}>{a.imagemUrl ? <img src={a.imagemUrl} alt={a.nome} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} /> : <div style={{ width: 36, height: 36, borderRadius: 6, background: '#F0EFEA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A09D94', fontSize: 15 }}>➕</div>}</td>
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

      {adicionais.length === 0 && <div className="card" style={{ padding: 24, textAlign: 'center' }}><div className="empty-state">Nenhum adicional cadastrado no banco de dados.</div></div>}
    </div>
  )
}
