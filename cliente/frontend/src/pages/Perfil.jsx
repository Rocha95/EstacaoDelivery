import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'

export default function Perfil() {
  const navigate = useNavigate()
  const { usuario, sair } = useAuth()

  if (!usuario) {
    return (
      <div className="app-frame">
        <div className="content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>👤</div>
          <p style={{ color: '#8A867C', fontSize: 13, marginBottom: 16 }}>Você ainda não entrou na sua conta.</p>
          <button className="btn-block btn-primary" onClick={() => navigate('/login')}>Entrar ou criar conta</button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="app-frame">
      <div className="top-nav-back" style={{ padding: '18px 18px 4px' }}><h1>Meu perfil</h1></div>
      <div className="content">
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="field"><label>Nome</label><input defaultValue={usuario.nome} /></div>
          <div className="field"><label>Celular</label><input defaultValue={usuario.telefone} /></div>
          <div className="field" style={{ marginBottom: 0 }}><label>E-mail</label><input placeholder="seuemail@exemplo.com" /></div>
        </div>
        <button className="btn-block btn-primary" style={{ marginBottom: 10 }}>Salvar alterações</button>
        <button className="btn-block btn-outline" onClick={sair}>Sair da conta</button>
      </div>
      <BottomNav />
    </div>
  )
}
