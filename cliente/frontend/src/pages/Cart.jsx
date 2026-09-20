import { useNavigate } from 'react-router-dom'
import TopNavBack from '../components/TopNavBack'
import { useCart } from '../context/CartContext'
import { getImagemUrl } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const navigate = useNavigate()
  const { itens, alterarQuantidade, removerItem, subtotal } = useCart()
  const { usuario } = useAuth()

  const irParaCheckout = () => {
    navigate(usuario ? '/checkout/entrega' : '/login?next=/checkout/entrega')
  }

  return (
    <div className="app-frame">
      <TopNavBack title="Seu carrinho" to="/" />
      <div className="content">
        {itens.length === 0 && <div className="empty-state">Seu carrinho está vazio. Volte ao cardápio para adicionar itens.</div>}

        {itens.map((item) => (
          <div className="list-row" key={item.chave}>
            <div className="list-thumb">
              {item.imagemUrl ? <img src={getImagemUrl(item.imagemUrl)} alt={item.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : item.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{item.nome}</div>
              {item.adicionais.length > 0 && (
                <div style={{ fontSize: 11.5, color: '#8A867C' }}>{item.adicionais.map((a) => a.nome).join(', ')}</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <div className="qty-control">
                  <button onClick={() => alterarQuantidade(item.chave, -1)}>−</button>
                  <span style={{ fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{item.quantidade}</span>
                  <button onClick={() => alterarQuantidade(item.chave, 1)}>+</button>
                </div>
                <span className="money" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                </span>
              </div>
            </div>
            <button onClick={() => removerItem(item.chave)} style={{ background: 'none', border: 'none', color: '#8A867C', fontSize: 16 }}>×</button>
          </div>
        ))}

        {itens.length > 0 && (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="summary-row">
              <span>Subtotal</span>
              <span className="money" style={{ fontFamily: 'var(--font-mono)' }}>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div style={{ fontSize: 11.5, color: '#8A867C', marginTop: 4 }}>Taxa de entrega e descontos são calculados na próxima etapa.</div>
          </div>
        )}
      </div>

      {itens.length > 0 && (
        <div style={{ padding: '12px 18px calc(16px + env(safe-area-inset-bottom))' }}>
          <button className="btn-block btn-primary" onClick={irParaCheckout}>Continuar · R$ {subtotal.toFixed(2)}</button>
        </div>
      )}
    </div>
  )
}
