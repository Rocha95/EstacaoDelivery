import { createContext, useContext, useState } from 'react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('usuario')
    return salvo ? JSON.parse(salvo) : null
  })

  const entrar = (dadosUsuario, token) => {
    setUsuario(dadosUsuario)
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario))
    if (token) {
      localStorage.setItem('token', token)
    }
  }

  const sair = () => {
    setUsuario(null)
    localStorage.removeItem('usuario')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ usuario, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}