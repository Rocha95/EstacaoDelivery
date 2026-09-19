import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StoreHeader from '../components/StoreHeader'
import BottomNav from '../components/BottomNav'
import BottomCartBar from '../components/BottomCartBar'
import { buscarProdutos, getImagemUrl } from '../services/api'

export default function Home() {
  const navigate = useNavigate()

  // Estados para dados do backend e controle de tela
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas')

  // Estado para rastrear imagens que falharem no carregamento
  const [errosImagem, setErrosImagem] = useState({})

  useEffect(() => {
    async function carregarProdutos() {
      try {
        setLoading(true)
        setError(null)
        const data = await buscarProdutos()
        setProdutos(data)
      } catch (err) {
        console.error('Erro ao buscar produtos:', err)
        setError('Não foi possível carregar o cardápio.')
      } finally {
        setLoading(false)
      }
    }

    carregarProdutos()
  }, [])

  // Helper para extrair o nome da categoria com segurança (seja objeto ou string)
  const getNomeCategoria = (categoria) => {
    if (!categoria) return null
    return typeof categoria === 'object' ? categoria.nome : categoria
  }

  // Extrai dinamicamente os nomes das categorias únicas
  const categorias = useMemo(() => {
    const lista = produtos
      .map((p) => getNomeCategoria(p.categoria))
      .filter((cat) => Boolean(cat))

    return Array.from(new Set(lista))
  }, [produtos])

  // Filtra os produtos com base na categoria selecionada
  const visiveis = useMemo(() => {
    if (categoriaAtiva === 'Todas') return produtos

    return produtos.filter((p) => {
      const nomeCat = getNomeCategoria(p.categoria)
      return nomeCat === categoriaAtiva
    })
  }, [categoriaAtiva, produtos])

  const handleImageError = (id) => {
    setErrosImagem((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <div className="app-frame">
      <StoreHeader />

      {/* Abas de Categorias */}
      <div className="category-tabs">
        {['Todas', ...categorias].map((c) => (
          <button
            key={c}
            className={`category-pill ${categoriaAtiva === c ? 'active' : ''}`}
            onClick={() => setCategoriaAtiva(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="content">
        <div className="section-title">
          {categoriaAtiva === 'Todas' ? 'Cardápio completo' : categoriaAtiva}
        </div>

        {/* Loading e Error States */}
        {loading && (
          <div className="empty-state" style={{ paddingTop: 40 }}>
            Carregando cardápio...
          </div>
        )}

        {error && (
          <div className="empty-state" style={{ paddingTop: 40, color: '#d32f2f' }}>
            {error}
          </div>
        )}

        {/* Grid de Produtos do Backend */}
        {!loading && !error && (
          <div className="product-grid">
            {visiveis.map((p) => {
              const idProduto = p.id || p._id
              const preco = Number(p.preco || p.valor || 0)
              
              // Campo da foto retornado pela API
              const fotoPath = p.foto || p.imagem || p.fotoUrl || p.imagemUrl || p.url
              const srcFinal = getImagemUrl(fotoPath)
              
              // Suporta tanto o boolean direct quanto inversão se houver flag 'indisponivel'
              const estaAtivo = p.ativo !== undefined ? Boolean(p.ativo) : !p.indisponivel

              return (
                <div
                  key={idProduto}
                  className={`product-card ${!estaAtivo ? 'disabled' : ''}`}
                  onClick={() => estaAtivo && navigate(`/produto/${idProduto}`)}
                >
                  {/* Thumbnail: Renderiza a foto enviada pelo backend ou cai de volta para emoji */}
                  <div className="product-thumb" style={{ overflow: 'hidden' }}>
                    {srcFinal && !errosImagem[idProduto] ? (
                      <img
                        src={srcFinal}
                        alt={p.nome}
                        onError={() => handleImageError(idProduto)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      p.emoji || '🍽️'
                    )}
                  </div>

                  <div className="product-info">
                    <div className="name">{p.nome}</div>
                    <div className="row">
                      <span className="price">R$ {preco.toFixed(2)}</span>
                      <span className="add-btn">{estaAtivo ? '+' : '×'}</span>
                    </div>
                    {!estaAtivo && (
                      <div style={{ fontSize: 10.5, color: '#8A867C', marginTop: 4 }}>
                        Indisponível agora
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && !error && visiveis.length === 0 && (
          <div className="empty-state">Nenhum produto nessa categoria.</div>
        )}
      </div>

      <BottomCartBar />
      <BottomNav />
    </div>
  )
}