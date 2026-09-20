import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StoreHeader from '../components/StoreHeader'
import BottomNav from '../components/BottomNav'
import BottomCartBar from '../components/BottomCartBar'
import { buscarProdutos, buscarCombos, getImagemUrl } from '../services/api'
import { useCart } from '../context/CartContext'

export default function Home() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState([])
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas')
  const [errosImagem, setErrosImagem] = useState({})
  const { adicionarCombo } = useCart()

  useEffect(() => {
    Promise.allSettled([buscarProdutos(), buscarCombos()])
      .then(([produtosResult, combosResult]) => {
        if (produtosResult.status === 'fulfilled') setProdutos(Array.isArray(produtosResult.value) ? produtosResult.value : [])
        else throw produtosResult.reason
        if (combosResult.status === 'fulfilled') setCombos(Array.isArray(combosResult.value) ? combosResult.value : [])
      })
      .catch((err) => setError(err.message || 'Não foi possível carregar o cardápio.'))
      .finally(() => setLoading(false))
  }, [])

  const categorias = useMemo(
    () => Array.from(new Set(produtos.map((p) => p.categoria?.nome || p.categoriaNome).filter(Boolean))),
    [produtos]
  )

  const visiveis = useMemo(() => {
    if (categoriaAtiva === 'Todas') return produtos
    return produtos.filter((p) => (p.categoria?.nome || p.categoriaNome) === categoriaAtiva)
  }, [categoriaAtiva, produtos])

  return (
    <div className="app-frame">
      <StoreHeader />
      <div className="category-tabs">
        {['Todas', ...categorias].map((c) => (
          <button key={c} className={`category-pill ${categoriaAtiva === c ? 'active' : ''}`} onClick={() => setCategoriaAtiva(c)}>{c}</button>
        ))}
      </div>
      <div className="content">
        <div className="section-title">{categoriaAtiva === 'Todas' ? 'Cardápio completo' : categoriaAtiva}</div>
        {loading && <div className="empty-state" style={{ paddingTop: 40 }}>Carregando cardápio...</div>}
        {error && <div className="empty-state" style={{ paddingTop: 40, color: '#d32f2f' }}>{error}</div>}
        {!loading && !error && (
          <div className="product-grid">
            {visiveis.map((p) => {
              const idProduto = p.id
              const src = getImagemUrl(p.imagemUrl)
              return (
                <div key={idProduto} className="product-card" onClick={() => { if (!p.controlaEstoque || Number(p.estoqueAtual) > 0) navigate(`/produto/${idProduto}`) }} style={{ opacity: p.controlaEstoque && Number(p.estoqueAtual) <= 0 ? 0.6 : 1 }}>
                  <div className="product-thumb" style={{ overflow: 'hidden' }}>
                    {src && !errosImagem[idProduto]
                      ? <img src={src} alt={p.nome} onError={() => setErrosImagem((prev) => ({ ...prev, [idProduto]: true }))} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : p.emoji || '🍽️'}
                  </div>
                  <div className="product-info">
                    <div className="name">{p.nome}</div>
                    <div className="row"><span className="price">R$ {Number(p.preco).toFixed(2)}</span>{p.controlaEstoque && Number(p.estoqueAtual) <= 0 ? <span className="pill pill-danger">Esgotado</span> : <span className="add-btn">+</span>}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {!loading && !error && visiveis.length === 0 && <div className="empty-state">Nenhum produto disponível.</div>}

        {!loading && !error && combos.length > 0 && (
          <section style={{ marginTop: 28, paddingBottom: 20 }}>
            <div className="section-title">Combos</div>
            <div className="product-grid">
              {combos.map((combo) => {
                const src = getImagemUrl(combo.imagemUrl)
                return (
                  <div key={combo.id} className="product-card">
                    <div className="product-thumb" style={{ overflow: 'hidden' }}>
                      {src
                        ? <img src={src} alt={combo.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : combo.emoji || '🍔'}
                    </div>
                    <div className="product-info">
                      <div className="name">{combo.nome}</div>
                      <div style={{ fontSize: 11.5, color: '#8A867C', margin: '4px 0 8px' }}>
                        {(combo.itens || []).map((item) => `${item.quantidade || 1}x ${item.produto?.nome || ''}`).join(', ')}
                      </div>
                      <div className="row">
                        <span className="price">R$ {Number(combo.preco).toFixed(2)}</span>
                        {combo.itens?.some((i) => i.produto?.controlaEstoque && Number(i.produto.estoqueAtual) < Number(i.quantidade || 1)) ? <span className="pill pill-danger">Esgotado</span> : <button className="add-btn" onClick={(e) => { e.stopPropagation(); adicionarCombo(combo) }}>+</button>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
      <BottomCartBar />
      <BottomNav />
    </div>
  )
}
