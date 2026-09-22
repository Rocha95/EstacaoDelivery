const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3333').replace(/\/$/, '')

export function imagemPublica(valor) {
  if (!valor) return ''
  const texto = String(valor).trim()
  if (!texto) return ''
  if (/^(blob:|data:|https?:\/\/)/i.test(texto)) return texto
  return `${API_URL}${texto.startsWith('/') ? '' : '/'}${texto}`
}
