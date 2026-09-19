import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError.js'
import { prisma } from '../lib/prisma.js'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_delivery_app'

export async function autenticar(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'Faça login para continuar.')

    const token = header.slice(7)
    const payload = jwt.verify(token, JWT_SECRET)

    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: { id: true, nome: true, telefone: true, email: true, tipo: true, ativo: true, criadoEm: true },
    })

    if (!usuario || !usuario.ativo || usuario.tipo !== 'CLIENTE') {
      throw new ApiError(401, 'Usuário não autorizado.')
    }

    req.usuario = usuario
    next()
  } catch (err) {
    if (err instanceof ApiError) return next(err)
    return next(new ApiError(401, 'Sessão inválida ou expirada.'))
  }
}
