import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Login'
import CheckoutEntrega from './pages/CheckoutEntrega'
import CheckoutPagamento from './pages/CheckoutPagamento'
import CheckoutConfirmacao from './pages/CheckoutConfirmacao'
import Acompanhamento from './pages/Acompanhamento'
import Historico from './pages/Historico'
import Perfil from './pages/Perfil'
import Enderecos from './pages/Enderecos'
import { useAuth } from './context/AuthContext'

function RotaProtegida({ children }) {
  const { usuario } = useAuth()
  const location = useLocation()
  const token = localStorage.getItem('token')

  if (!usuario || !token) {
    const destino = `${location.pathname}${location.search}`
    return <Navigate to={`/login?next=${encodeURIComponent(destino)}`} replace />
  }

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produto/:id" element={<ProductDetail />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout/entrega" element={<RotaProtegida><CheckoutEntrega /></RotaProtegida>} />
          <Route path="/checkout/pagamento" element={<RotaProtegida><CheckoutPagamento /></RotaProtegida>} />
          <Route path="/checkout/confirmacao/:id" element={<RotaProtegida><CheckoutConfirmacao /></RotaProtegida>} />
          <Route path="/pedido/:id" element={<RotaProtegida><Acompanhamento /></RotaProtegida>} />
          <Route path="/historico" element={<RotaProtegida><Historico /></RotaProtegida>} />
          <Route path="/perfil" element={<RotaProtegida><Perfil /></RotaProtegida>} />
          <Route path="/enderecos" element={<RotaProtegida><Enderecos /></RotaProtegida>} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
