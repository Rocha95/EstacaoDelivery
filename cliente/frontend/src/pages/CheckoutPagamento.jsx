import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNavBack from '../components/TopNavBack'
import { useCart } from '../context/CartContext'
import { cuponsValidos, calcularTaxaEntrega } from '../data/mock'

export default function CheckoutPagamento() {
  const navigate = useNavigate()
  const { subtotal, modoEntrega, enderecoSelecionado, cupom, setCupom, pagamento, setPagamento } = useCart()
  const [codigoCupom, setCodigoCupom] = useState('')
  const [erroCupom, setErroCupom] = useState('')

  const taxaEntrega = modoEntrega === 'delivery' && enderecoSelecionado
    ? calcularTaxaEntrega(enderecoSelecionado.distanciaKm)
    : 0

  const desconto = useMemo(() => {
    if (!cupom) return 0
    if (subtotal < cupom.minimo) return 0
    if (cupom.tipo === 'percentual') return subtotal * (cupom.valor / 100)
    if (cupom.tipo === 'valor_fixo') return cupom.valor
    return 0
  }, [cupom, subtotal])

  const freteGratis = cupom?.tipo === 'frete' && subtotal >= cupom.minimo
  const taxaFinal = freteGratis ? 0 : taxaEntrega
  const total = Math.max(0, subtotal - desconto + taxaFinal)

  const aplicarCupom = () => {
    const codigo = codigoCupom.trim().toUpperCase()
    const dados = cuponsValidos[codigo]
    if (!dados) {
      setErroCupom('Cupom inválido ou expirado.')
      setCupom(null)
      return
    }
    if (subtotal < dados.minimo) {
      setErroCupom(`Pedido mínimo de R$ ${dados.minimo.toFixed(2)} para esse cupom.`)
      setCupom(null)
      return
    }
    setErroCupom('')
    setCupom({ codigo, ...dados })
  }

  const finalizar = () => {
    if (!pagamento) return
    navigate('/checkout/confirmacao')
  }

  return (
    <div className="app-frame">
      <TopNavBack title="Pagamento" to="/checkout/entrega" />
      <div className="content">
        <div className="section-title">Cupom de desconto</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <input
            style={{ flex: 1, padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13.5 }}
            placeholder="Código do cupom"
            value={codigoCupom}
            onChange={(e) => setCodigoCupom(e.target.value)}
          />
          <button className="btn-outline" style={{ borderRadius: 8, padding: '0 16px', fontWeight: 700 }} onClick={aplicarCupom}>Aplicar</button>
        </div>
        {erroCupom && <div style={{ color: 'var(--chili)', fontSize: 12, marginBottom: 8 }}>{erroCupom}</div>}
        {cupom && !erroCupom && <div style={{ color: 'var(--basil)', fontSize: 12, marginBottom: 8, fontWeight: 700 }}>Cupom {cupom.codigo} aplicado ✓</div>}

        <div className="section-title">Forma de pagamento</div>
        <div className={`option-row ${pagamento === 'pix' ? 'selected' : ''}`} onClick={() => setPagamento('pix')}>
          <div><div className="title">💠 Pix</div><div className="subtitle">Pague antes e agilize o preparo</div></div>
          <div className="radio-dot" />
        </div>
        <div className={`option-row ${pagamento === 'entrega' ? 'selected' : ''}`} onClick={() => setPagamento('entrega')}>
          <div><div className="title">💵 Na entrega</div><div className="subtitle">Dinheiro ou cartão com a maquininha</div></div>
          <div className="radio-dot" />
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="summary-row"><span>Subtotal</span><span className="money" style={{ fontFamily: 'var(--font-mono)' }}>R$ {subtotal.toFixed(2)}</span></div>
          {modoEntrega === 'delivery' && (
            <div className="summary-row">
              <span>Taxa de entrega</span>
              <span className="money" style={{ fontFamily: 'var(--font-mono)' }}>
                {freteGratis ? 'Grátis' : `R$ ${taxaFinal.toFixed(2)}`}
              </span>
            </div>
          )}
          {desconto > 0 && (
            <div className="summary-row" style={{ color: 'var(--basil)' }}>
              <span>Desconto ({cupom.codigo})</span>
              <span className="money" style={{ fontFamily: 'var(--font-mono)' }}>− R$ {desconto.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total"><span>Total</span><span className="money" style={{ fontFamily: 'var(--font-mono)' }}>R$ {total.toFixed(2)}</span></div>
        </div>
      </div>

      <div style={{ padding: '12px 18px calc(16px + env(safe-area-inset-bottom))' }}>
        <button className="btn-block btn-primary" disabled={!pagamento} onClick={finalizar}>
          Confirmar pedido · R$ {total.toFixed(2)}
        </button>
      </div>
    </div>
  )
}
