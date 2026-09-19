import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopNavBack from '../components/TopNavBack'
import { useCart } from '../context/CartContext'
import { buscarProdutoPorId, getImagemUrl } from '../services/api'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { adicionarItem } = useCart()

  // Estados para gerenciar os dados da API
  const [produto, setProduto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgError, setImgError] = useState(false)

  // Estados locais do pedido
  const [quantidade, setQuantidade] = useState(1)
  const [selecionados, setSelecionados] = useState([])

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        setError(null)
        // Busca o registro REAL no banco de dados via GET /api/produtos/:id
        const data = await buscarProdutoPorId(id)
        setProduto(data)
      } catch (err) {
        console.error('Erro ao buscar produto:', err)
        setError('Não foi possível carregar os dados do produto.')
      } finally {
        setLoading(false)
      }
    }

    if (id) carregar()
  }, [id])

  if (loading) {
    return (
      <div className="app-frame">
        <TopNavBack title="Detalhes do produto" />
        <div className="content" style={{ textAlign: 'center', paddingTop: 40 }}>
          Carregando produto...
        </div>
      </div>
    )
  }

  if (error || !produto) {
    return (
      <div className="app-frame">
        <TopNavBack title="Detalhes do produto" />
        <div className="content" style={{ textAlign: 'center', paddingTop: 40 }}>
          {error || 'Produto não encontrado.'}
        </div>
      </div>
    )
  }

  // Identifica o campo da imagem retornado pelo banco (seja foto, imagem, fotoUrl, imagemUrl ou url)
  const fotoPath =
    produto.foto ||
    produto.imagem ||
    produto.fotoUrl ||
    produto.imagemUrl ||
    produto.url

  const srcFinal = getImagemUrl(fotoPath)

  // Suporta variações de nomenclatura de adicionais vindo do banco/ORM
  const adicionaisList = produto.adicionais || produto.grupos || []

  const toggleOpcao = (grupo, opcao) => {
    const nomeGrupo = grupo.grupo || grupo.nome
    const nomeOpcao = opcao.nome || opcao.titulo
    const precoOpcao = Number(opcao.preco || opcao.valor || 0)

    setSelecionados((prev) => {
      const jaTem = prev.find((o) => o.nome === nomeOpcao && o.grupo === nomeGrupo)
      if (jaTem) {
        return prev.filter((o) => !(o.nome === nomeOpcao && o.grupo === nomeGrupo))
      }

      const doGrupo = prev.filter((o) => o.grupo === nomeGrupo)
      const grupoInfo = adicionaisList.find(
        (g) => (g.grupo || g.nome) === nomeGrupo
      )

      const maxPermitido = grupoInfo?.max ?? grupoInfo?.quantidadeMaxima ?? 99

      if (doGrupo.length >= maxPermitido) return prev
      return [...prev, { grupo: nomeGrupo, nome: nomeOpcao, preco: precoOpcao }]
    })
  }

  const precoBase = Number(produto.preco || produto.valor || 0)
  const precoAdicionais = selecionados.reduce((s, o) => s + (o.preco || 0), 0)
  const total = (precoBase + precoAdicionais) * quantidade

  const confirmar = () => {
    adicionarItem(produto, selecionados, quantidade)
    navigate(-1)
  }

  return (
    <div className="app-frame">
      <TopNavBack title="Detalhes do produto" />
      <div className="content">
        {/* Container da Foto vinda do Upload do Restaurante */}
        <div
          className="product-thumb"
          style={{
            height: 160,
            borderRadius: 16,
            fontSize: 56,
            marginBottom: 14,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F3F2EE'
          }}
        >
          {srcFinal && !imgError ? (
            <img
              src={srcFinal}
              alt={produto.nome}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            produto.emoji || '🍽️'
          )}
        </div>

        <h2 style={{ margin: '0 0 6px', fontSize: 17 }}>{produto.nome}</h2>
        <div style={{ color: '#6B675F', fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>
          {produto.descricao}
        </div>
        <div className="price" style={{ fontSize: 16 }}>
          R$ {precoBase.toFixed(2)}
        </div>

        {/* Adicionais / Opcionais do Banco */}
        {adicionaisList.map((grupo) => {
          const nomeGrupo = grupo.grupo || grupo.nome
          const maxGrupo = grupo.max ?? grupo.quantidadeMaxima
          const opcoesGrupo = grupo.opcoes || grupo.itens || []

          return (
            <div key={nomeGrupo} style={{ marginTop: 18 }}>
              <div
                className="section-title"
                style={{ margin: '0 0 8px', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>{nomeGrupo}</span>
                {maxGrupo && (
                  <span style={{ color: '#8A867C', fontWeight: 500 }}>até {maxGrupo}</span>
                )}
              </div>

              {opcoesGrupo.map((opcao) => {
                const nomeOpcao = opcao.nome || opcao.titulo
                const precoOpcao = Number(opcao.preco || opcao.valor || 0)
                const ativo = selecionados.some(
                  (o) => o.nome === nomeOpcao && o.grupo === nomeGrupo
                )

                return (
                  <div
                    key={nomeOpcao}
                    className={`option-row ${ativo ? 'selected' : ''}`}
                    onClick={() => toggleOpcao(grupo, opcao)}
                  >
                    <div>
                      <div className="title">{nomeOpcao}</div>
                      {precoOpcao > 0 && (
                        <div className="subtitle">+ R$ {precoOpcao.toFixed(2)}</div>
                      )}
                    </div>
                    <div className="radio-dot" />
                  </div>
                )
              })}
            </div>
          )
        })}

        <div style={{ marginTop: 20 }}>
          <div className="section-title">Quantidade</div>
          <div className="qty-control">
            <button onClick={() => setQuantidade((q) => Math.max(1, q - 1))}>−</button>
            <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
              {quantidade}
            </span>
            <button onClick={() => setQuantidade((q) => q + 1)}>+</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 18px calc(16px + env(safe-area-inset-bottom))' }}>
        <button className="btn-block btn-primary" onClick={confirmar}>
          Adicionar · R$ {total.toFixed(2)}
        </button>
      </div>
    </div>
  )
}