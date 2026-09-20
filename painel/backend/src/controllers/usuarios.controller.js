import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const PAPEIS = new Set(['ADMINISTRADOR', 'GERENTE', 'COZINHA', 'ATENDIMENTO'])

export async function listar(req, res) {
  const usuarios = await prisma.usuario.findMany({ where: { tipo: 'EQUIPE' }, select: { id: true, nome: true, email: true, papel: true, ativo: true, criadoEm: true }, orderBy: { nome: 'asc' } })
  res.json(usuarios)
}

export async function criar(req, res) {
  const { nome, email, papel, senha } = req.body
  if (!nome?.trim() || !email?.trim() || !papel || !senha) throw new ApiError(400, 'Informe nome, email, papel e senha.')
  if (!PAPEIS.has(papel)) throw new ApiError(400, 'Papel de usuário inválido.')
  if (String(senha).length < 6) throw new ApiError(400, 'A senha deve ter pelo menos 6 caracteres.')
  const senhaHash = await bcrypt.hash(senha, 10)
  const usuario = await prisma.usuario.create({ data: { nome: nome.trim(), email: email.trim().toLowerCase(), papel, senhaHash, tipo: 'EQUIPE' }, select: { id: true, nome: true, email: true, papel: true, ativo: true } })
  res.status(201).json(usuario)
}

export async function atualizar(req, res) {
  const { id } = req.params
  const { nome, email, papel, senha } = req.body
  if (papel !== undefined && !PAPEIS.has(papel)) throw new ApiError(400, 'Papel de usuário inválido.')
  const data = { ...(nome !== undefined && { nome: nome.trim() }), ...(email !== undefined && { email: email.trim().toLowerCase() }), ...(papel !== undefined && { papel }) }
  if (senha) data.senhaHash = await bcrypt.hash(senha, 10)
  const usuario = await prisma.usuario.update({ where: { id }, data, select: { id: true, nome: true, email: true, papel: true, ativo: true } })
  res.json(usuario)
}

export async function alternarAtivo(req, res) {
  const { id } = req.params
  const atual = await prisma.usuario.findUnique({ where: { id }, select: { ativo: true } })
  if (!atual) throw new ApiError(404, 'Usuário não encontrado.')
  const usuario = await prisma.usuario.update({ where: { id }, data: { ativo: !atual.ativo }, select: { id: true, nome: true, email: true, papel: true, ativo: true } })
  res.json(usuario)
}

export async function remover(req, res) { await prisma.usuario.delete({ where: { id: req.params.id } }); res.status(204).send() }
