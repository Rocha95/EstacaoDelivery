import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

export async function listar(req, res) { res.json(await prisma.estabelecimento.findMany({ orderBy: { nome: 'asc' } })) }
export async function criar(req, res) {
  const { nome, slug } = req.body
  if (!nome?.trim() || !slug?.trim()) throw new ApiError(400, 'Informe nome e slug.')
  const item = await prisma.estabelecimento.create({ data: { nome: nome.trim(), slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-') } })
  await prisma.configuracao.create({ data: { id: `config-${item.id}`, estabelecimentoId: item.id, nomeEstabelecimento: item.nome, endereco: '' } })
  res.status(201).json(item)
}
export async function alternarAtivo(req, res) { const item = await prisma.estabelecimento.findUnique({ where: { id: req.params.id } }); if (!item) throw new ApiError(404, 'Estabelecimento não encontrado.'); res.json(await prisma.estabelecimento.update({ where: { id: item.id }, data: { ativo: !item.ativo } })) }
