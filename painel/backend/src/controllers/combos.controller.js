import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3333}`
const INCLUDE_ITENS = { itens: { include: { produto: true } } }

function resolverImagemUrl(req) {
  if (req.file) return `${BASE_URL}/uploads/combos/${req.file.filename}`
  if (req.body.imagemUrl) return req.body.imagemUrl
  if (req.body.removerImagem === 'true') return null
  return undefined
}

function formatarCombo(combo) {
  return { ...combo, economiza: calcularEconomia(combo) }
}

function calcularEconomia(combo) {
  const somaItens = combo.itens.reduce((s, i) => s + Number(i.produto.preco) * i.quantidade, 0)
  return Math.max(0, somaItens - Number(combo.preco))
}

export async function listar(req, res) {
  const combos = await prisma.combo.findMany({ include: INCLUDE_ITENS, orderBy: { nome: 'asc' } })
  res.json(combos.map(formatarCombo))
}

export async function criar(req, res) {
  let itens = req.body.itens
  if (typeof itens === 'string') {
    try { itens = JSON.parse(itens) } catch { itens = [] }
  }
  const { nome, preco } = req.body
  if (!nome || preco === undefined || !itens?.length) {
    throw new ApiError(400, 'Informe nome, preço e ao menos um produto do combo.')
  }

  const imagemUrl = resolverImagemUrl(req)
  const combo = await prisma.combo.create({
    data: {
      nome,
      preco: Number(preco),
      imagemUrl,
      itens: { create: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade ?? 1 })) },
    },
    include: INCLUDE_ITENS,
  })
  res.status(201).json(formatarCombo(combo))
}

export async function atualizar(req, res) {
  const { id } = req.params
  let itens = req.body.itens
  if (typeof itens === 'string') {
    try { itens = JSON.parse(itens) } catch { itens = undefined }
  }
  const data = {}
  if (req.body.nome !== undefined) data.nome = req.body.nome
  if (req.body.preco !== undefined) data.preco = Number(req.body.preco)
  const imagemUrl = resolverImagemUrl(req)
  if (imagemUrl !== undefined) data.imagemUrl = imagemUrl

  if (itens !== undefined) {
    if (!Array.isArray(itens) || !itens.length) throw new ApiError(400, 'O combo precisa ter ao menos um produto.')
    data.itens = {
      deleteMany: {},
      create: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade ?? 1 })),
    }
  }

  const combo = await prisma.combo.update({ where: { id }, data, include: INCLUDE_ITENS })
  res.json(formatarCombo(combo))
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
  res.json(formatarCombo(combo))
}

export async function remover(req, res) {
  await prisma.combo.delete({ where: { id: req.params.id } })
  res.status(204).send()
}
