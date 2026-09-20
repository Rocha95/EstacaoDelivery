import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNavBack from '../components/TopNavBack'
import { useCart } from '../context/CartContext'
import { calcularTaxaEntrega, criarPedido, validarCupom } from '../services/api'

export default function CheckoutPagamento() {
  const navigate = useNavigate()
  const { itens, subtotal, modoEntrega, enderecoSelecionado, cupom, setCupom, pagamento, setPagamento } = useCart()
  const [codigoCupom, setCodigoCupom] = useState('')
  const [taxaEntrega, setTaxaEntrega] = useState(0)
  const [erro, setErro] = useState('')
  const [carregandoTaxa, setCarregandoTaxa] = useState(false)
  const [finalizando, setFinalizando] = useState(false)
  const [agendar, setAgendar] = useState(false)
  const [agendadoPara, setAgendadoPara] = useState('')

  useEffect(() => {
    if (modoEntrega !== 'delivery' || !enderecoSelecionado) {
      setTaxaEntrega(0)
      return
    }
    setCarregandoTaxa(true)
    calcularTaxaEntrega(enderecoSelecionado.id)
      .then((resultado) => {
        if (!resultado.dentroDoRaio) throw new Error('O endereço está fora do raio de entrega.')
        setTaxaEntrega(Number(resultado.valor) || 0)
      })
      .catch((err) => setErro(err.message))
      .finally(() => setCarregandoTaxa(false))
  }, [modoEntrega, enderecoSelecionado])

  const desconto = (() => {
    if (!cupom) return 0
    if (cupom.tipo === 'PERCENTUAL') return Math.min(subtotal, subtotal * Number(cupom.valor) / 100)
    if (cupom.tipo === 'VALOR_FIXO') return Math.min(subtotal, Number(cupom.valor))
    return 0
  })()

  const freteGratis = cupom?.tipo === 'FRETE_GRATIS'
  const taxaFinal = freteGratis ? 0 : taxaEntrega
  const total = Math.max(0, subtotal - desconto + taxaFinal)

  const aplicarCupom = async () => {
    try {
      setErro('')
      const codigo = codigoCupom.trim().toUpperCase()
      if (!codigo) return
      const dados = await validarCupom(codigo, subtotal)
      setCupom(dados)
    } catch (err) {
      setCupom(null)
      setErro(err.message)
    }
  }

  const finalizar = async () => {
    if (!pagamento || finalizando || carregandoTaxa || itens.length === 0) return
    if (agendar && !agendadoPara) { setErro('Escolha a data e o horário do agendamento.'); return }
    if (modoEntrega === 'delivery' && !enderecoSelecionado) {
      setErro('Selecione um endereço de entrega.')
      return
    }

    try {
      setFinalizando(true)
      setErro('')

      const pedido = await criarPedido({
        tipoEntrega: modoEntrega === 'delivery' ? 'DELIVERY' : 'RETIRADA',
        enderecoId: modoEntrega === 'delivery' ? enderecoSelecionado.id : undefined,
        formaPagamento: pagamento,
        cupomId: cupom?.id || undefined,
        agendadoPara: agendar ? agendadoPara : undefined,
        itens: itens.map((item) => ({
          produtoId: item.produtoId || undefined,
          comboId: item.comboId || undefined,
          quantidade: item.quantidade,
          adicionais: item.produtoId ? item.adicionais.map((a) => ({ opcaoId: a.opcaoId })) : [],
        })),
      })

      navigate(`/checkout/confirmacao/${pedido.id}`, { replace: true })
    } catch (err) {
      setErro(err.message || 'Não foi possível criar o pedido.')
    } finally {
      setFinalizando(false)
    }
  }

  return (
    <div className="app-frame">
      <TopNavBack title="Pagamento" to="/checkout/entrega" />
      <div className="content">
        <div className="section-title">Cupom de desconto</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <input style={{ flex: 1, padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13.5 }} placeholder="Código do cupom" value={codigoCupom} onChange={(e) => setCodigoCupom(e.target.value)} />
          <button className="btn-outline" style={{ borderRadius: 8, padding: '0 16px', fontWeight: 700 }} onClick={aplicarCupom}>Aplicar</button>
        </div>
        {cupom && <div style={{ color: 'var(--basil)', fontSize: 12, marginBottom: 8, fontWeight: 700 }}>Cupom {cupom.codigo} aplicado ✓</div>}

        <div className="section-title">Quando receber?</div>
        <div className={`option-row ${!agendar ? 'selected' : ''}`} onClick={() => setAgendar(false)}>
          <div><div className="title">⚡ O mais rápido possível</div><div className="subtitle">Produção assim que o pedido for aceito</div></div><div className="radio-dot" />
        </div>
        <div className={`option-row ${agendar ? 'selected' : ''}`} onClick={() => setAgendar(true)}>
          <div><div className="title">🕐 Agendar pedido</div><div className="subtitle">Escolha uma data e horário</div></div><div className="radio-dot" />
        </div>
        {agendar && (
          <div className="card" style={{ margin: '8px 0 16px' }}>
            <div className="field">
              <label>Data e horário</label>
              <input type="datetime-local" value={agendadoPara} min={new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)} onChange={(e) => setAgendadoPara(e.target.value)} />
              <div style={{ fontSize: 11.5, color: '#8A867C', marginTop: 6 }}>Agendamento com pelo menos 30 minutos de antecedência e até 7 dias.</div>
            </div>
          </div>
        )}

        <div className="section-title">Forma de pagamento</div>
        <div className={`option-row ${pagamento === 'PIX' ? 'selected' : ''}`} onClick={() => setPagamento('PIX')}>
          <div><div className="title">💠 Pix</div><div className="subtitle">Pagamento via Pix</div></div><div className="radio-dot" />
        </div>
        <div className={`option-row ${pagamento === 'DINHEIRO_ENTREGA' ? 'selected' : ''}`} onClick={() => setPagamento('DINHEIRO_ENTREGA')}>
          <div><div className="title">💵 Dinheiro na entrega</div><div className="subtitle">Pagamento ao receber</div></div><div className="radio-dot" />
        </div>
        <div className={`option-row ${pagamento === 'CARTAO_ENTREGA' ? 'selected' : ''}`} onClick={() => setPagamento('CARTAO_ENTREGA')}>
          <div><div className="title">💳 Cartão na entrega</div><div className="subtitle">Pagamento na maquininha</div></div><div className="radio-dot" />
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="summary-row"><span>Subtotal</span><span className="money">R$ {subtotal.toFixed(2)}</span></div>
          {modoEntrega === 'delivery' && <div className="summary-row"><span>Taxa de entrega</span><span className="money">{freteGratis ? 'Grátis' : `R$ ${taxaFinal.toFixed(2)}`}</span></div>}
          {desconto > 0 && <div className="summary-row" style={{ color: 'var(--basil)' }}><span>Desconto ({cupom.codigo})</span><span className="money">− R$ {desconto.toFixed(2)}</span></div>}
          <div className="summary-row total"><span>Total</span><span className="money">R$ {total.toFixed(2)}</span></div>
        </div>

        {erro && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 12 }}>{erro}</div>}
      </div>

      <div style={{ padding: '12px 18px calc(16px + env(safe-area-inset-bottom))' }}>
        <button className="btn-block btn-primary" disabled={!pagamento || finalizando || carregandoTaxa} onClick={finalizar}>
          {finalizando ? 'Enviando pedido...' : `Confirmar pedido · R$ ${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}
