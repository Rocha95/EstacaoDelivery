// Define a URL base (padrão porta 3333)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

// Helper para tratar a URL da imagem vinda do backend
export function getImagemUrl(caminhoOuUrl) {
  if (!caminhoOuUrl) return null
  if (caminhoOuUrl.startsWith('http://') || caminhoOuUrl.startsWith('https://')) {
    return caminhoOuUrl
  }
  return `${API_URL}${caminhoOuUrl.startsWith('/') ? '' : '/'}${caminhoOuUrl}`
}

// Helper genérico para requisições com tratamento de erro e injeção do Token JWT
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || `Erro na requisição: Status ${res.status}`)
    }

    return await res.json()
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      throw new Error('Servidor indisponível. Verifique se o backend está rodando.')
    }
    throw err
  }
}

// Endpoints de Autenticação
export const authApi = {
  login: (dados) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),
  register: (dados) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),
}

// Funções de Produtos
export async function buscarProdutos() {
  return request('/api/produtos')
}

export async function buscarProdutoPorId(id) {
  return request(`/api/produtos/${id}`)
}

// Funções de Pedidos
export async function buscarPedidos() {
  return request('/api/pedidos')
}

export async function criarPedido(dadosPedido) {
  return request('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify(dadosPedido),
  })
}

// Funções de Endereço do Cliente
export async function buscarEnderecos() {
  return request('/api/enderecos')
}

export async function criarEndereco(dadosEndereco) {
  return request('/api/enderecos', {
    method: 'POST',
    body: JSON.stringify(dadosEndereco),
  })
}

export async function deletarEndereco(id) {
  return request(`/api/enderecos/${id}`, {
    method: 'DELETE',
  })
}