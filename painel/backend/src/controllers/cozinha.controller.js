import { prisma } from '../lib/prisma.js'

const include = { cliente: { select: { id: true, nome: true, telefone: true } }, itens: { include: { produto: true, combo: true, adicionais: true } }, endereco: true }

export async function listar(req, res) {
  const pedidos = await prisma.pedido.findMany({ where: { estabelecimentoId: req.estabelecimentoId, status: { in: ['RECEBIDO', 'EM_PRODUCAO'] } }, include, orderBy: [{ agendadoPara: 'asc' }, { criadoEm: 'asc' }] })
  res.json(pedidos)
}

export async function iniciar(req, res) {
  const pedido = await prisma.pedido.findFirst({ where: { id: req.params.id, estabelecimentoId: req.estabelecimentoId } })
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' })
  if (pedido.status !== 'RECEBIDO') return res.status(409).json({ erro: 'Somente pedidos recebidos podem entrar em produção.' })
  const atualizado = await prisma.pedido.update({ where: { id: pedido.id }, data: { status: 'EM_PRODUCAO', producaoEm: new Date() }, include })
  res.json(atualizado)
}
