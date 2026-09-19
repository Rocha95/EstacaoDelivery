import { useEffect, useState } from 'react'

export default function Adicionais() {
  const [adicionais, setAdicionais] = useState([])
  const [form, setForm] = useState({ nome: '', preco: '', grupo: '', imagemUrl: '', arquivoImagem: null })
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 1. Carrega os adicionais do banco com fallback gracioso
  useEffect(() => {
    async function fetchAdicionais() {
      try {
        setLoading(true)
        const response = await fetch('/api/adicionais')

        if (response.ok) {
          const data = await response.json()
          setAdicionais(Array.isArray(data) ? data : [])
        } else {
          console.warn(`API /api/adicionais retornou status ${response.status}. Usando lista vazia.`)
          setAdicionais([])
        }
      } catch (err) {
        console.warn('Erro de rede ou backend off-line ao buscar adicionais:', err)
        setAdicionais([])
      } finally {
        setLoading(false)
      }
    }

    fetchAdicionais()
  }, [])

  // Seleção de arquivo local (preview via ObjectURL, igual à tela de Produtos)
  const handleImageFile = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm((prev) => ({ ...prev, arquivoImagem: file, imagemUrl: '' }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // 2. Alterna status (PATCH /api/adicionais/:id)
  const toggleAtivo = async (id, statusAtual) => {
    const novoStatus = !statusAtual

    setAdicionais((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ativo: novoStatus } : a))
    )

    try {
      const response = await fetch(`/api/adicionais/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: novoStatus }),
      })

      if (!response.ok) throw new Error()
    } catch (err) {
      // Reverte em caso de falha no servidor
      setAdicionais((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ativo: statusAtual } : a))
      )
    }
  }

  // 3. Cadastra novo adicional — FormData porque pode ir junto um arquivo de imagem
  const adicionar = async (e) => {
    e.preventDefault()
    if (!form.nome.trim()) return

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('nome', form.nome.trim())
      formData.append('grupo', form.grupo.trim() || 'Outros')
      formData.append('preco', parseFloat(form.preco) || 0)
      formData.append('ativo', 'true')

      if (form.arquivoImagem) {
        formData.append('imagem', form.arquivoImagem)
      } else if (form.imagemUrl) {
        formData.append('imagemUrl', form.imagemUrl)
      }

      const response = await fetch('/api/adicionais', {
        method: 'POST',
        // Não definir Content-Type manualmente — o navegador cuida do boundary.
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.erro || 'Falha ao cadastrar o adicional no servidor')
      }

      const itemCriado = await response.json()
      setAdicionais((prev) => [...prev, itemCriado])
      setForm({ nome: '', preco: '', grupo: '', imagemUrl: '', arquivoImagem: null })
      setImagePreview('')
    } catch (err) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const grupos = [...new Set(adicionais.map((a) => a.grupo || 'Outros'))]

  if (loading) return <div className="loading">Carregando adicionais...</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Adicionais</h2>
          <div className="muted">Itens extras que o cliente pode incluir nos pedidos</div>
        </div>
      </div>

      <form className="card" style={{ padding: 16, marginBottom: 20 }} onSubmit={adicionar}>
        <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr auto' }}>
          <div className="field">
            <label>Nome do adicional</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Cheddar extra"
              disabled={submitting}
              required
            />
          </div>
          <div className="field">
            <label>Grupo</label>
            <input
              value={form.grupo}
              onChange={(e) => setForm({ ...form, grupo: e.target.value })}
              placeholder="Ex: Adicionais de lanche"
              list="grupos"
              disabled={submitting}
            />
            <datalist id="grupos">
              {grupos.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label>Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value })}
              placeholder="0,00"
              disabled={submitting}
            />
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'end' }}>
            <button className="btn btn-primary" type="submit" disabled={submitting || !form.nome.trim()}>
              {submitting ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </div>

        {/* Foto do adicional — mesma UI da tela de Produtos: arquivo ou URL colada */}
        <div className="field" style={{ marginTop: 4 }}>
          <label>Foto do adicional (exibida no App)</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="file" accept="image/*" onChange={handleImageFile} disabled={submitting} style={{ fontSize: 13 }} />
            <span style={{ fontSize: 12, color: '#8A867C' }}>ou colar URL:</span>
            <input
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              value={form.imagemUrl}
              disabled={submitting}
              onChange={(e) => {
                setForm({ ...form, imagemUrl: e.target.value, arquivoImagem: null })
                setImagePreview(e.target.value)
              }}
              style={{ flex: 1, minWidth: 220 }}
            />
          </div>

          {imagePreview && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: 12, color: '#d9534f' }}
                onClick={() => {
                  setImagePreview('')
                  setForm({ ...form, imagemUrl: '', arquivoImagem: null })
                }}
              >
                Remover foto
              </button>
            </div>
          )}
        </div>
      </form>

      {grupos.map((grupo) => {
        const itensDoGrupo = adicionais.filter((a) => (a.grupo || 'Outros') === grupo)

        return (
          <div key={grupo} style={{ marginBottom: 20 }}>
            <div className="section-head" style={{ marginBottom: 8 }}>
              <h2 style={{ fontSize: 13, color: '#8A867C' }}>{grupo}</h2>
            </div>
            <div className="card">
              <table className="data-table">
                <tbody>
                  {itensDoGrupo.map((a) => {
                    const precoNum = Number(a.preco) || 0
                    const estaAtivo = Boolean(a.ativo)

                    return (
                      <tr key={a.id}>
                        <td style={{ width: 46 }}>
                          {a.imagemUrl ? (
                            <img
                              src={a.imagemUrl}
                              alt={a.nome}
                              style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 6,
                                background: '#F0EFEA',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#A09D94',
                                fontSize: 15,
                              }}
                            >
                              ➕
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: 600 }}>{a.nome}</td>
                        <td className="money">
                          {precoNum > 0 ? `+ R$ ${precoNum.toFixed(2)}` : 'Sem custo'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className={`toggle ${estaAtivo ? 'on' : ''}`}
                            onClick={() => toggleAtivo(a.id, estaAtivo)}
                            title="Ativar/inativar adicional"
                          >
                            <span className="knob" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {adicionais.length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div className="empty-state">Nenhum adicional cadastrado no banco de dados.</div>
        </div>
      )}
    </div>
  )
}
