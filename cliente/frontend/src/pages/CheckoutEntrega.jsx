import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNavBack from '../components/TopNavBack'
import { useCart } from '../context/CartContext'
import { buscarEnderecos, criarEndereco } from '../services/api'
import { calcularTaxaEntrega } from '../data/mock'

export default function CheckoutEntrega() {
  const navigate = useNavigate()
  const { modoEntrega, setModoEntrega, enderecoSelecionado, setEnderecoSelecionado } = useCart()

  const [enderecos, setEnderecos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [novoEndereco, setNovoEndereco] = useState(false)
  const [form, setForm] = useState({ apelido: 'Novo endereço', rua: '', bairro: '', numero: '', complemento: '' })

  // Carregar endereços da API
  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true)
        const dados = await buscarEnderecos()
        setEnderecos(dados || [])
        
        // Se já houver um endereço no contexto ou na lista, seleciona o primeiro por padrão
        if (!enderecoSelecionado && dados && dados.length > 0) {
          setEnderecoSelecionado(dados[0])
        }
      } catch (err) {
        console.error('Erro ao carregar endereços do backend:', err)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const escolherModo = (modo) => {
    setModoEntrega(modo)
    if (modo === 'retirada') setEnderecoSelecionado(null)
  }

  const confirmarNovoEndereco = async () => {
    if (!form.rua) return

    try {
      setSalvando(true)
      const payload = {
        apelido: form.apelido || 'Endereço',
        rua: form.rua,
        logradouro: form.rua, // <--- Adicione esta linha
        bairro: form.bairro,
        numero: form.numero,
        complemento: form.complemento,
        distanciaKm: 5
      }

      // Salva no backend
      const enderecoCriado = await criarEndereco(payload)
      
      const itemFinal = enderecoCriado || { ...payload, id: Date.now() }

      setEnderecos((prev) => [...prev, itemFinal])
      setEnderecoSelecionado(itemFinal)
      setNovoEndereco(false)
      setForm({ apelido: 'Novo endereço', rua: '', bairro: '', numero: '', complemento: '' })
    } catch (err) {
      console.error('Erro ao salvar endereço:', err)
      alert('Não foi possível salvar o endereço. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const podeAvancar = modoEntrega === 'retirada' || (modoEntrega === 'delivery' && enderecoSelecionado)

  return (
    <div className="app-frame">
      <TopNavBack title="Entrega ou retirada" to="/carrinho" />
      <div className="content">
        <div
          className={`option-row ${modoEntrega === 'delivery' ? 'selected' : ''}`}
          onClick={() => escolherModo('delivery')}
        >
          <div>
            <div className="title">🛵 Receber via delivery</div>
            <div className="subtitle">Taxa calculada pela distância até você</div>
          </div>
          <div className="radio-dot" />
        </div>

        <div
          className={`option-row ${modoEntrega === 'retirada' ? 'selected' : ''}`}
          onClick={() => escolherModo('retirada')}
        >
          <div>
            <div className="title">🏠 Retirar no local</div>
            <div className="subtitle">Av. Presidente Vargas, 450 · sem taxa</div>
          </div>
          <div className="radio-dot" />
        </div>

        {modoEntrega === 'delivery' && (
          <>
            <div className="section-title">Onde entregamos?</div>

            {carregando ? (
              <div style={{ padding: '12px 0', color: '#8A867C' }}>Carregando endereços...</div>
            ) : (
              enderecos.map((e) => (
                <div
                  key={e.id}
                  className={`option-row ${enderecoSelecionado?.id === e.id ? 'selected' : ''}`}
                  onClick={() => setEnderecoSelecionado(e)}
                >
                  <div>
                    <div className="title">{e.apelido || 'Endereço'}</div>
                    <div className="subtitle">
                      {e.rua} {e.numero ? `, ${e.numero}` : ''} {e.bairro ? `· ${e.bairro}` : ''}{' '}
                      {e.distanciaKm ? `· ${e.distanciaKm} km` : ''}
                    </div>
                  </div>
                  <div className="radio-dot" />
                </div>
              ))
            )}

            {!novoEndereco ? (
              <button
                className="btn-block btn-outline"
                style={{ marginTop: 10 }}
                onClick={() => setNovoEndereco(true)}
              >
                + Usar outro endereço
              </button>
            ) : (
              <div className="card" style={{ marginTop: 10 }}>
                <div className="field">
                  <label>Rua</label>
                  <input
                    value={form.rua}
                    onChange={(e) => setForm({ ...form, rua: e.target.value })}
                    placeholder="Ex: Av. Paulista"
                  />
                </div>
                <div className="field" style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label>Número</label>
                    <input
                      value={form.numero}
                      onChange={(e) => setForm({ ...form, numero: e.target.value })}
                      placeholder="123"
                    />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label>Bairro</label>
                    <input
                      value={form.bairro}
                      onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                      placeholder="Bairro"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Complemento</label>
                  <input
                    value={form.complemento}
                    onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                    placeholder="Apto, Bloco, etc."
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    className="btn-block btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => setNovoEndereco(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-block btn-primary"
                    style={{ flex: 2 }}
                    disabled={salvando || !form.rua}
                    onClick={confirmarNovoEndereco}
                  >
                    {salvando ? 'Salvando...' : 'Usar este endereço'}
                  </button>
                </div>
              </div>
            )}

            {enderecoSelecionado && (
              <div className="card" style={{ marginTop: 14 }}>
                <div className="summary-row">
                  <span>Taxa de entrega estimada</span>
                  <span className="money" style={{ fontFamily: 'var(--font-mono)' }}>
                    R${' '}
                    {calcularTaxaEntrega(
                      Number(enderecoSelecionado.distanciaKm) || 5
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ padding: '12px 18px calc(16px + env(safe-area-inset-bottom))' }}>
        <button
          className="btn-block btn-primary"
          disabled={!podeAvancar}
          onClick={() => navigate('/checkout/pagamento')}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}