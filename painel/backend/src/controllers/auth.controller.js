import { prisma } from '../lib/prisma.js'
import { login } from '../services/auth.js'
import { ApiError } from '../utils/ApiError.js'

export async function entrar(req, res) {
  const { email, senha } = req.body || {}
  if (!email || !senha) throw new ApiError(400, 'Informe e-mail e senha.')
  const result = await login({ email, senha, estabelecimentoId: req.estabelecimentoId })
  res.cookie('estacao_session', result.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000, path: '/' })
  res.json({ usuario: { id: result.usuario.id, nome: result.usuario.nome, email: result.usuario.email, papel: result.usuario.papel, podeCriarUsuarios: result.usuario.podeCriarUsuarios }, expiraEm: result.expiraEm })
}

export async function atual(req, res) {
  res.json({ usuario: { id: req.usuario.id, nome: req.usuario.nome, email: req.usuario.email, papel: req.usuario.papel, podeCriarUsuarios: req.usuario.podeCriarUsuarios } })
}

export async function sair(req, res) {
  if (req.sessao) await prisma.sessaoUsuario.delete({ where: { id: req.sessao.id } }).catch(() => {})
  res.clearCookie('estacao_session', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' })
  res.status(204).send()
}
