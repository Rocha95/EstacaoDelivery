import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNavBack from '../components/TopNavBack'
import { useCart } from '../context/CartContext'
import { buscarEnderecos, buscarConfiguracao, calcularTaxaEntrega, criarEndereco } from '../services/api'

const FORM_INICIAL = {
  apelido: 'Novo endereço', rua: '', bairro: '', numero: '', complemento: '', cidade: '', estado: '', cep: '',
}

export default function CheckoutEntrega() {
  const navigate = useNavigate()
  const { enderecoSelecionado, setEnderecoSelecionado, modoEntrega, setModoEntrega } = useCart()
  const [enderecos, setEnderecos] = useState([])
  const [config, setConfig] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [novoEndereco, setNovoEndereco] = useState(false)
  const [taxas, setTaxas] = useState({})
  const [form, setForm] = useState(FORM_INICIAL)

  useEffect(() => {
    Promise.all([buscarEnderecos(), buscarConfiguracao()])
      .then(([dados, configuracao]) => {
        setEnderecos(dados || [])
        setConfig(configuracao)
        if (!enderecoSelecionado && dados?.length) setEnderecoSelecionado(dados[0])
        if (!modoEntrega) setModoEntrega(configuracao?.aceitaDelivery ? 'delivery' : 'retirada')
      })
      .catch((err) => console.error('Erro ao carregar checkout:', err))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    if (modoEntrega !== 'delivery' || !enderecos.length) return
    let cancelado = false

    async function calcularTodas() {
      const resultados = await Promise.all(enderecos.map(async (endereco) => {
        try {
          return [endereco.id, await calcularTaxaEntrega(endereco.id)]
        } catch (err) {
          return [endereco.id, { dentroDoRaio: false, erro: err.message }]
        }
      }))
      if (!cancelado) setTaxas(Object.fromEntries(resultados))
    }

    calcularTodas()
    return () => { cancelado = true }
  }, [modoEntrega, enderecos])

  const escolherModo = (modo) => {
    setModoEntrega(modo)
    if (modo === 'retirada') setEnderecoSelecionado(null)
    else if (!enderecoSelecionado && enderecos.length) setEnderecoSelecionado(enderecos[0])
  }

  const confirmarNovoEndereco = async () => {
    if (!form.rua.trim() || !form.bairro.trim() || !form.cidade.trim() || !form.estado.trim()) {
      alert('Informe rua, bairro, cidade e estado.')
      return
    }

    try {
      setSalvando(true)
      const enderecoCriado = await criarEndereco(form)
      setEnderecos((prev) => [enderecoCriado, ...prev])
      setEnderecoSelecionado(enderecoCriado)
      setNovoEndereco(false)
      setForm(FORM_INICIAL)
      const resultado = await calcularTaxaEntrega(enderecoCriado.id)
      setTaxas((prev) => ({ ...prev, [enderecoCriado.id]: resultado }))
    } catch (err) {
      alert(err.message || 'Não foi possível salvar/localizar o endereço.')
    } finally {
      setSalvando(false)
    }
  }

  const selecionadoForaDoRaio = enderecoSelecionado && taxas[enderecoSelecionado.id] && !taxas[enderecoSelecionado.id].dentroDoRaio
  const podeAvancar = !carregando && (
    modoEntrega === 'retirada' ||
    (modoEntrega === 'delivery' && enderecoSelecionado && taxas[enderecoSelecionado.id]?.dentroDoRaio)
  )

  return (
    <div className="app-frame">
      <TopNavBack title="Entrega ou retirada" to="/carrinho" />
      <div className="content">
        {config?.aceitaDelivery && (
          <div className={`option-row ${modoEntrega === 'delivery' ? 'selected' : ''}`} onClick={() => escolherModo('delivery')}>
            <div><div className="title">🛵 Receber via delivery</div><div className="subtitle">Taxa calculada automaticamente pelo endereço</div></div><div className="radio-dot" />
          </div>
        )}
        {config?.aceitaRetirada && (
          <div className={`option-row ${modoEntrega === 'retirada' ? 'selected' : ''}`} onClick={() => escolherModo('retirada')}>
            <div><div className="title">🏠 Retirar no local</div><div className="subtitle">{config.endereco || 'No estabelecimento'} · sem taxa</div></div><div className="radio-dot" />
          </div>
        )}

        {modoEntrega === 'delivery' && (
          <>
            <div className="section-title">Onde entregamos?</div>
            {carregando ? <div style={{ padding: 12, color: '#8A867C' }}>Carregando endereços...</div> : (
              enderecos.map((e) => {
                const taxa = taxas[e.id]
                return (
                  <div key={e.id} className={`option-row ${enderecoSelecionado?.id === e.id ? 'selected' : ''}`} onClick={() => setEnderecoSelecionado(e)}>
                    <div>
                      <div className="title">{e.apelido || 'Endereço'}</div>
                      <div className="subtitle">{e.rua}{e.numero ? `, ${e.numero}` : ''} {e.bairro ? `· ${e.bairro}` : ''}</div>
                      <div className="subtitle">
                        {taxa?.distanciaKm != null
                          ? `${Number(taxa.distanciaKm).toFixed(2)} km · ${taxa.dentroDoRaio ? `R$ ${Number(taxa.valor).toFixed(2)}` : 'Fora do raio'}`
                          : taxa?.erro || 'Calculando localização...'}
                      </div>
                    </div>
                    <div className="radio-dot" />
                  </div>
                )
              })
            )}

            {!novoEndereco ? (
              <button className="btn-block btn-outline" style={{ marginTop: 10 }} onClick={() => setNovoEndereco(true)}>+ Usar outro endereço</button>
            ) : (
              <div className="card" style={{ marginTop: 10 }}>
                {['rua','numero','bairro','cidade','estado','cep'].map((campo) => (
                  <div className="field" key={campo}>
                    <label>{campo === 'rua' ? 'Rua' : campo === 'numero' ? 'Número' : campo === 'bairro' ? 'Bairro' : campo === 'cidade' ? 'Cidade' : campo === 'estado' ? 'Estado' : 'CEP'}</label>
                    <input value={form[campo]} onChange={(e) => setForm({ ...form, [campo]: e.target.value })} />
                  </div>
                ))}
                <div className="field">
                  <label>Complemento</label>
                  <input value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} />
                </div>
                <div style={{ fontSize: 12, color: '#6B675F', marginTop: 8 }}>
                  A localização e a distância até o estabelecimento serão calculadas automaticamente.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn-block btn-outline" style={{ flex: 1 }} onClick={() => setNovoEndereco(false)}>Cancelar</button>
                  <button className="btn-block btn-primary" style={{ flex: 2 }} disabled={salvando || !form.rua || !form.bairro || !form.cidade || !form.estado} onClick={confirmarNovoEndereco}>{salvando ? 'Localizando...' : 'Usar este endereço'}</button>
                </div>
              </div>
            )}

            {selecionadoForaDoRaio && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 10 }}>Este endereço está fora do raio máximo de entrega.</div>}
          </>
        )}
      </div>

      <div style={{ padding: '12px 18px calc(16px + env(safe-area-inset-bottom))' }}>
        <button className="btn-block btn-primary" disabled={!podeAvancar} onClick={() => navigate('/checkout/pagamento')}>Continuar</button>
      </div>
    </div>
  )
}
