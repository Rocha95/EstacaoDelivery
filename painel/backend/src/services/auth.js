import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const SESSION_HOURS = 24
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

export async function login({ email, senha, estabelecimentoId }) {
  const usuario = await prisma.usuario.findFirst({ where: { email: String(email || '').trim().toLowerCase(), tipo: 'EQUIPE', estabelecimentoId } })
  if (!usuario || !usuario.ativo) throw new ApiError(401, 'E-mail ou senha inválidos.')
  const ok = await bcrypt.compare(String(senha || ''), usuario.senhaHash)
  if (!ok) throw new ApiError(401, 'E-mail ou senha inválidos.')

  const token = crypto.randomBytes(48).toString('hex')
  const expiraEm = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000)
  await prisma.sessaoUsuario.create({ data: { tokenHash: hashToken(token), usuarioId: usuario.id, expiraEm } })
  return { token, expiraEm, usuario }
}

export async function autenticarToken(token, estabelecimentoId) {
  if (!token) throw new ApiError(401, 'Sessão não encontrada. Faça login novamente.')
  const sessao = await prisma.sessaoUsuario.findUnique({ where: { tokenHash: hashToken(token) }, include: { usuario: true } })
  if (!sessao || sessao.expiraEm <= new Date() || !sessao.usuario.ativo || sessao.usuario.tipo !== 'EQUIPE' || sessao.usuario.estabelecimentoId !== estabelecimentoId) {
    if (sessao) await prisma.sessaoUsuario.delete({ where: { id: sessao.id } }).catch(() => {})
    throw new ApiError(401, 'Sua sessão expirou. Faça login novamente.')
  }
  return sessao
}

export const tokenDoRequest = (req) => {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  const cookie = req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('estacao_session='))
  return cookie?.split('=').slice(1).join('=') || null
}

export { hashToken }
