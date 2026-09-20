import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopNavBack from '../components/TopNavBack'
import { useCart } from '../context/CartContext'
import { buscarProdutoPorId, getImagemUrl } from '../services/api'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { adicionarItem } = useCart()
  const [produto, setProduto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgError, setImgError] = useState(false)
  const [quantidade, setQuantidade] = useState(1)
  const [selecionados, setSelecionados] = useState([])

  useEffect(() => {
    let ativo = true
    buscarProdutoPorId(id)
      .then((data) => ativo && setProduto(data))
      .catch((err) => ativo && setError(err.message || 'Não foi possível carregar o produto.'))
      .finally(() => ativo && setLoading(false))
    return () => { ativo = false }
  }, [id])

  const grupos = useMemo(() => produto?.gruposAdicionais || [], [produto])

  if (loading) return <div className="app-frame"><TopNavBack title="Detalhes do produto" /><div className="content">Carregando produto...</div></div>
  if (error || !produto) return <div className="app-frame"><TopNavBack title="Detalhes do produto" /><div className="content">{error || 'Produto não encontrado.'}</div></div>

  const fotoPath = produto.imagemUrl
  const srcFinal = getImagemUrl(fotoPath)
  const precoBase = Number(produto.preco) || 0

  const toggleOpcao = (grupo, opcao) => {
    setSelecionados((prev) => {
      const jaTem = prev.some((o) => o.opcaoId === opcao.id)
      if (jaTem) return prev.filter((o) => o.opcaoId !== opcao.id)

      const doGrupo = prev.filter((o) => o.grupoId === grupo.id)
      if (doGrupo.length >= grupo.maximoSelecao) return prev

      return [...prev, {
        opcaoId: opcao.id,
        grupoId: grupo.id,
        nome: opcao.nome,
        preco: Number(opcao.preco) || 0,
      }]
    })
  }

  const precoAdicionais = selecionados.reduce((s, o) => s + o.preco, 0)
  const total = (precoBase + precoAdicionais) * quantidade

  const confirmar = () => {
    const faltantes = grupos.filter((g) => g.obrigatorio && !selecionados.some((o) => o.grupoId === g.id))
    if (faltantes.length) {
      alert(`Selecione uma opção em: ${faltantes.map((g) => g.nome).join(', ')}.`)
      return
    }
    adicionarItem(produto, selecionados, quantidade)
    navigate('/carrinho')
  }

  return (
    <div className="app-frame">
      <TopNavBack title="Detalhes do produto" />
      <div className="content">
        <div className="product-thumb" style={{ height: 160, borderRadius: 16, fontSize: 56, marginBottom: 14, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F2EE' }}>
          {srcFinal && !imgError
            ? <img src={srcFinal} alt={produto.nome} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : produto.emoji || '🍽️'}
        </div>

        <h2 style={{ margin: '0 0 6px', fontSize: 17 }}>{produto.nome}</h2>
        <div style={{ color: '#6B675F', fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>{produto.descricao}</div>
        <div className="price" style={{ fontSize: 16 }}>R$ {precoBase.toFixed(2)}</div>

        {grupos.map((grupo) => (
          <div key={grupo.id} style={{ marginTop: 18 }}>
            <div className="section-title" style={{ margin: '0 0 8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{grupo.nome}{grupo.obrigatorio ? ' *' : ''}</span>
              <span style={{ color: '#8A867C', fontWeight: 500 }}>até {grupo.maximoSelecao}</span>
            </div>
            {grupo.opcoes.filter((o) => o.ativo).map((opcao) => {
              const selecionado = selecionados.some((o) => o.opcaoId === opcao.id)
              const preco = Number(opcao.preco) || 0
              return (
                <div key={opcao.id} className={`option-row ${selecionado ? 'selected' : ''}`} onClick={() => toggleOpcao(grupo, opcao)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {opcao.imagemUrl
                      ? <img src={getImagemUrl(opcao.imagemUrl)} alt={opcao.nome} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                      : <div style={{ width: 48, height: 48, borderRadius: 8, background: '#F3F2EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>＋</div>}
                    <div><div className="title">{opcao.nome}</div>{preco > 0 && <div className="subtitle">+ R$ {preco.toFixed(2)}</div>}</div>
                  </div>
                  <div className="radio-dot" />
                </div>
              )
            })}
          </div>
        ))}

        <div style={{ marginTop: 20 }}>
          <div className="section-title">Quantidade</div>
          <div className="qty-control">
            <button onClick={() => setQuantidade((q) => Math.max(1, q - 1))}>−</button>
            <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{quantidade}</span>
            <button onClick={() => setQuantidade((q) => q + 1)}>+</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 18px calc(16px + env(safe-area-inset-bottom))' }}>
        <button className="btn-block btn-primary" onClick={confirmar}>Adicionar · R$ {total.toFixed(2)}</button>
      </div>
    </div>
  )
}
