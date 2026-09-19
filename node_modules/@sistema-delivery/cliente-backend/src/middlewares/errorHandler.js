import { ApiError } from '../utils/ApiError.js'

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ApiError) {
    return res.status(err.status).json({ erro: err.message })
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ erro: 'Registro não encontrado.' })
  }
  if (err.code === 'P2002') {
    const campo = err.meta?.target?.join?.(', ') ?? 'campo único'
    return res.status(409).json({ erro: `Já existe um registro com esse ${campo}.` })
  }
  if (err.code === 'P2003') {
    return res.status(400).json({ erro: 'Referência inválida (registro relacionado não existe).' })
  }
  console.error(err)
  return res.status(500).json({ erro: 'Erro interno do servidor.' })
}

export function notFoundHandler(req, res) {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` })
}
