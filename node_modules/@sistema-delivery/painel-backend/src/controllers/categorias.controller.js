import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

export async function listar(req, res) {
  const categorias = await prisma.categoria.findMany({
    orderBy: { ordem: 'asc' },
    include: { _count: { select: { produtos: true } } },
  })
  res.json(categorias.map((c) => ({ ...c, produtos: c._count.produtos, _count: undefined })))
}

export async function criar(req, res) {
  const { nome, ordem } = req.body
  if (!nome) throw new ApiError(400, 'Informe o nome da categoria.')

  const ultima = await prisma.categoria.count()
  const categoria = await prisma.categoria.create({
    data: { nome, ordem: ordem ?? ultima + 1 },
  })
  res.status(201).json(categoria)
}

export async function atualizar(req, res) {
  const { id } = req.params
  const { nome, ordem, ativa } = req.body
  const categoria = await prisma.categoria.update({
    where: { id },
    data: { nome, ordem, ativa },
  })
  res.json(categoria)
}

export async function remover(req, res) {
  const { id } = req.params
  await prisma.categoria.delete({ where: { id } })
  res.status(204).send()
}
