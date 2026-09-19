import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

export async function listar(req, res) {
  const cupons = await prisma.cupom.findMany({
    include: { _count: { select: { pedidos: true } } },
    orderBy: { criadoEm: 'desc' },
  })
  res.json(cupons.map((c) => ({ ...c, usos: c._count.pedidos, _count: undefined })))
}

export async function criar(req, res) {
  const { codigo, tipo, valor, pedidoMinimo, validoAte } = req.body
  if (!codigo || !tipo) throw new ApiError(400, 'Informe código e tipo do cupom.')

  const cupom = await prisma.cupom.create({
    data: {
      codigo: codigo.toUpperCase(),
      tipo,
      valor: valor ?? 0,
      pedidoMinimo: pedidoMinimo ?? 0,
      validoAte: validoAte ? new Date(validoAte) : null,
    },
  })
  res.status(201).json({ ...cupom, usos: 0 })
}

export async function atualizar(req, res) {
  const { id } = req.params
  const { codigo, tipo, valor, pedidoMinimo, validoAte } = req.body
  const cupom = await prisma.cupom.update({
    where: { id },
    data: {
      codigo: codigo ? codigo.toUpperCase() : undefined,
      tipo,
      valor,
      pedidoMinimo,
      validoAte: validoAte ? new Date(validoAte) : undefined,
    },
  })
  res.json(cupom)
}

export async function alternarAtivo(req, res) {
  const { id } = req.params
  const atual = await prisma.cupom.findUnique({ where: { id }, select: { ativo: true } })
  if (!atual) throw new ApiError(404, 'Cupom não encontrado.')

  const cupom = await prisma.cupom.update({ where: { id }, data: { ativo: !atual.ativo } })
  res.json(cupom)
}

export async function remover(req, res) {
  await prisma.cupom.delete({ where: { id: req.params.id } })
  res.status(204).send()
}
