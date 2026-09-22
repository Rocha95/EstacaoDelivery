import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ApiError) {
    return res.status(err.status).json({ erro: err.message, ...(err.code ? { codigo: err.code } : {}) })
  }

  // Erros do multer (upload de foto): arquivo grande demais, campo errado, etc.
  if (err instanceof multer.MulterError) {
    const mensagens = {
      LIMIT_FILE_SIZE: 'A imagem enviada é muito grande (máximo 5MB).',
    }
    return res.status(400).json({ erro: mensagens[err.code] || `Erro no upload: ${err.message}` })
  }

  // Erros do próprio fileFilter do multer (ex: formato de imagem não aceito)
  if (err.message?.includes('Formato de imagem')) {
    return res.status(400).json({ erro: err.message })
  }

  // Erros conhecidos do Prisma (código de erro do cliente)
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
