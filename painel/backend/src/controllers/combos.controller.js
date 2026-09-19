import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const INCLUDE_ITENS = { itens: { include: { produto: true } } }

function calcularEconomia(combo) {
  const somaItens = combo.itens.reduce((s, i) => s + Number(i.produto.preco) * i.quantidade, 0)
  return Math.max(0, somaItens - Number(combo.preco))
}

export async function listar(req, res) {
  const combos = await prisma.combo.findMany({ include: INCLUDE_ITENS, orderBy: { nome: 'asc' } })
  res.json(combos.map((c) => ({ ...c, economiza: calcularEconomia(c) })))
}

export async function criar(req, res) {
  const { nome, preco, itens } = req.body
  if (!nome || preco === undefined || !itens?.length) {
    throw new ApiError(400, 'Informe nome, preço e ao menos um produto do combo.')
  }

  const combo = await prisma.combo.create({
    data: {
      nome,
      preco,
      itens: { create: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade ?? 1 })) },
    },
    include: INCLUDE_ITENS,
  })
  res.status(201).json({ ...combo, economiza: calcularEconomia(combo) })
}

export async function alternarAtivo(req, res) {
  const { id } = req.params
  const atual = await prisma.combo.findUnique({ where: { id }, select: { ativo: true } })
  if (!atual) throw new ApiError(404, 'Combo não encontrado.')

  const combo = await prisma.combo.update({
    where: { id },
    data: { ativo: !atual.ativo },
    include: INCLUDE_ITENS,
  })
  res.json({ ...combo, economiza: calcularEconomia(combo) })
}

export async function remover(req, res) {
  await prisma.combo.delete({ where: { id: req.params.id } })
  res.status(204).send()
}
