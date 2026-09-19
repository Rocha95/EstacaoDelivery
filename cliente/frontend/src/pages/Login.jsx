import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TopNavBack from '../components/TopNavBack'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const { entrar } = useAuth()

  const [modo, setModo] = useState('entrar') // 'entrar' | 'cadastrar'
  const [form, setForm] = useState({ nome: '', telefone: '', senha: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const submeter = async (e) => {
    e.preventDefault()
    if (!form.telefone || !form.senha) return

    setLoading(true)
    setErro('')

    try {
      if (modo === 'cadastrar') {
        // 1. Salva o usuário no Banco de Dados via API
        await authApi.register({
          nome: form.nome,
          telefone: form.telefone,
          senha: form.senha
        })

        // 2. Após registrar, faz o login para obter token e dados
        const respostaLogin = await authApi.login({
          telefone: form.telefone,
          senha: form.senha
        })

        // 3. Atualiza o contexto e redireciona
        entrar(respostaLogin.usuario, respostaLogin.token)
      } else {
        // Login direto
        const respostaLogin = await authApi.login({
          telefone: form.telefone,
          senha: form.senha
        })

        entrar(respostaLogin.usuario, respostaLogin.token)
      }

      navigate(next)
    } catch (err) {
      setErro(err.message || 'Não foi possível completar a operação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-frame">
      <TopNavBack title="Identificação" to="/" />
      
      <div className="content">
        {/* Alternador Entrar / Criar Conta */}
        <div className="segmented" style={{ background: 'transparent', padding: 0, gap: 8, marginBottom: 18 }}>
          <button
            type="button"
            className={modo === 'entrar' ? 'active' : ''}
            style={{
              border: '1px solid var(--line)',
              background: modo === 'entrar' ? 'var(--ink)' : 'var(--paper-raised)',
              color: modo === 'entrar' ? '#fff' : 'var(--graphite)',
            }}
            onClick={() => { setModo('entrar'); setErro(''); }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={modo === 'cadastrar' ? 'active' : ''}
            style={{
              border: '1px solid var(--line)',
              background: modo === 'cadastrar' ? 'var(--ink)' : 'var(--paper-raised)',
              color: modo === 'cadastrar' ? '#fff' : 'var(--graphite)',
            }}
            onClick={() => { setModo('cadastrar'); setErro(''); }}
          >
            Criar conta
          </button>
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div style={{ color: '#d32f2f', marginBottom: 12, fontSize: '0.9rem' }}>
            {erro}
          </div>
        )}

        {/* Formulário do Cliente */}
        <form onSubmit={submeter}>
          {modo === 'cadastrar' && (
            <div className="field">
              <label>Nome completo</label>
              <input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Como podemos te chamar"
                required
              />
            </div>
          )}
          
          <div className="field">
            <label>Celular</label>
            <input
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              placeholder="(00) 00000-0000"
              required
            />
          </div>
          
          <div className="field">
            <label>Senha</label>
            <input
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            className="btn-block btn-primary" 
            type="submit" 
            disabled={loading}
            style={{ marginTop: 6 }}
          >
            {loading 
              ? 'Aguarde...' 
              : modo === 'entrar' ? 'Entrar' : 'Criar conta e continuar'
            }
          </button>
        </form>
      </div>
    </div>
  )
}