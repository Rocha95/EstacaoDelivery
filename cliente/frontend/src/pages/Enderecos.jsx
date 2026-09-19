import { useEffect, useState } from 'react'
import BottomNav from '../components/BottomNav'
import { buscarEnderecos, criarEndereco, deletarEndereco } from '../services/api'

export default function Enderecos() {
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState(null)

  const [novo, setNovo] = useState(false)
  const [form, setForm] = useState({ apelido: '', rua: '', bairro: '', numero: '', complemento: '' })

  // Carrega a lista de endereços do backend ao montar a tela
  useEffect(() => {
    carregarEnderecos()
  }, [])

  async function carregarEnderecos() {
    try {
      setLoading(true)
      setError(null)
      const data = await buscarEnderecos()
      setLista(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erro ao buscar endereços:', err)
      setError('Não foi possível carregar seus endereços.')
    } finally {
      setLoading(false)
    }
  }

  const adicionar = async () => {
    if (!form.rua) return

    try {
      setSalvando(true)
      
      const payload = {
        apelido: form.apelido || 'Endereço',
        rua: form.rua,
        bairro: form.bairro,
        numero: form.numero,
        complemento: form.complemento,
      }

      const novoEndereco = await criarEndereco(payload)
      
      // Atualiza a lista com a resposta da API ou recarrega
      if (novoEndereco && (novoEndereco.id || novoEndereco._id)) {
        setLista((prev) => [...prev, novoEndereco])
      } else {
        await carregarEnderecos()
      }

      setForm({ apelido: '', rua: '', bairro: '', numero: '', complemento: '' })
      setNovo(false)
    } catch (err) {
      console.error('Erro ao criar endereço:', err)
      alert('Erro ao salvar o endereço. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const remover = async (id) => {
    if (!window.confirm('Deseja realmente remover este endereço?')) return

    try {
      await deletarEndereco(id)
      setLista((prev) => prev.filter((e) => (e.id || e._id) !== id))
    } catch (err) {
      console.error('Erro ao remover endereço:', err)
      alert('Erro ao remover o endereço.')
    }
  }

  return (
    <div className="app-frame">
      <div className="top-nav-back" style={{ padding: '18px 18px 4px' }}>
        <h1>Meus endereços</h1>
      </div>

      <div className="content">
        {/* Loading State */}
        {loading && (
          <div className="empty-state" style={{ paddingTop: 30 }}>
            Carregando endereços...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="empty-state" style={{ paddingTop: 30, color: '#d32f2f' }}>
            {error}
          </div>
        )}

        {/* Lista de Endereços */}
        {!loading &&
          !error &&
          lista.map((e) => {
            const idEndereco = e.id || e._id
            return (
              <div
                key={idEndereco}
                className="card"
                style={{
                  marginBottom: 10,
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{e.apelido || 'Endereço'}</div>
                  <div style={{ fontSize: 12, color: '#8A867C' }}>
                    {e.rua}{e.numero ? `, ${e.numero}` : ''} {e.bairro ? `· ${e.bairro}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => remover(idEndereco)}
                  style={{ background: 'none', border: 'none', color: '#8A867C', fontSize: 18, cursor: 'pointer', padding: '4px 8px' }}
                >
                  ×
                </button>
              </div>
            )
          })}

        {!loading && !error && lista.length === 0 && !novo && (
          <div className="empty-state" style={{ marginBottom: 16 }}>
            Nenhum endereço cadastrado.
          </div>
        )}

        {/* Formulário / Botão de Adicionar */}
        {!loading && !error && (
          <>
            {!novo ? (
              <button className="btn-block btn-outline" onClick={() => setNovo(true)}>
                + Adicionar endereço
              </button>
            ) : (
              <div className="card">
                <div className="field">
                  <label>Apelido</label>
                  <input
                    value={form.apelido}
                    onChange={(e) => setForm({ ...form, apelido: e.target.value })}
                    placeholder="Ex: Casa, Trabalho"
                  />
                </div>
                <div className="field">
                  <label>Rua e número</label>
                  <input
                    value={form.rua}
                    onChange={(e) => setForm({ ...form, rua: e.target.value })}
                    placeholder="Ex: Av. Paulista, 1000"
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Bairro</label>
                  <input
                    value={form.bairro}
                    onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                    placeholder="Ex: Centro"
                  />
                </div>
                <button
                  className="btn-block btn-primary"
                  style={{ marginTop: 12 }}
                  onClick={adicionar}
                  disabled={salvando || !form.rua}
                >
                  {salvando ? 'Salvando...' : 'Salvar endereço'}
                </button>
                <button
                  className="btn-block btn-outline"
                  style={{ marginTop: 8 }}
                  onClick={() => setNovo(false)}
                  disabled={salvando}
                >
                  Cancelar
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}