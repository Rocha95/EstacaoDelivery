import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

export async function listar(req, res) {
  const itens = await prisma.avaliacao.findMany({ where: { pedido: { estabelecimentoId: req.estabelecimentoId } }, include: { cliente: { select: { id: true, nome: true } }, pedido: { select: { id: true, numero: true, criadoEm: true } } }, orderBy: { criadoEm: 'desc' } })
  res.json(itens)
}
export async function responder(req, res) {
  const { resposta } = req.body
  const atual = await prisma.avaliacao.findFirst({ where: { id: req.params.id, pedido: { estabelecimentoId: req.estabelecimentoId } } })
  if (!atual) throw new ApiError(404, 'Avaliação não encontrada.')
  const item = await prisma.avaliacao.update({ where: { id: atual.id }, data: { resposta: resposta?.trim() || null } })
  res.json(item)
}
