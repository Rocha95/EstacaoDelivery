import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const fetchOriginal = window.fetch.bind(window)
window.fetch = (input, init = {}) => {
  const headers = new Headers(init.headers || {})
  const estabelecimentoId = localStorage.getItem('estabelecimentoId')
  if (estabelecimentoId) headers.set('X-Estabelecimento-Id', estabelecimentoId)
  return fetchOriginal(input, { ...init, headers, credentials: init.credentials || 'include' })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
