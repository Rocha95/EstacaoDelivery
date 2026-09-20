import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const INCLUDE_PADRAO = { categoria: { include: { adicionais: { where: { ativo: true }, orderBy: { nome: 'asc' } } } } }
function formatar(produto) { return { ...produto, categoriaNome: produto.categoria?.nome, gruposAdicionais: produto.categoria ? [{ id: produto.categoria.id, nome: produto.categoria.nome, maximoSelecao: (produto.categoria.adicionais || []).length, obrigatorio: false, opcoes: produto.categoria.adicionais || [] }] : [] } }
function resolverImagemUrl(req) { if (req.file) return `/uploads/produtos/${req.file.filename}`; if (req.body.imagemUrl) return req.body.imagemUrl; return undefined }

export async function listar(req, res) {
  const { categoriaId, ativo } = req.query
  const produtos = await prisma.produto.findMany({ where: { estabelecimentoId: req.estabelecimentoId, categoriaId: categoriaId || undefined, ativo: ativo === undefined ? undefined : ativo === 'true' }, include: INCLUDE_PADRAO, orderBy: { nome: 'asc' } })
  res.json(produtos.map(formatar))
}
export async function obter(req, res) {
  const produto = await prisma.produto.findFirst({ where: { id: req.params.id, estabelecimentoId: req.estabelecimentoId }, include: INCLUDE_PADRAO })
  if (!produto) throw new ApiError(404, 'Produto não encontrado.')
  res.json(formatar(produto))
}
export async function criar(req, res) {
  const { nome, descricao, categoriaId, emoji, disponibilidadeInicio, disponibilidadeFim } = req.body
  const preco = req.body.preco !== undefined ? Number(req.body.preco) : undefined
  const ativo = req.body.ativo === undefined ? true : req.body.ativo === 'true' || req.body.ativo === true
  if (!nome || preco === undefined || Number.isNaN(preco) || !categoriaId) throw new ApiError(400, 'Informe nome, preço e categoria do produto.')
  const categoria = await prisma.categoria.findFirst({ where: { id: categoriaId, estabelecimentoId: req.estabelecimentoId, ativa: true } })
  if (!categoria) throw new ApiError(400, 'Categoria não encontrada ou inativa.')
  const produto = await prisma.produto.create({ data: { estabelecimentoId: req.estabelecimentoId, nome: nome.trim(), descricao, preco, emoji, categoriaId, disponibilidadeInicio, disponibilidadeFim, ativo, imagemUrl: resolverImagemUrl(req), controlaEstoque: req.body.controlaEstoque === 'true' || req.body.controlaEstoque === true, estoqueAtual: Math.max(0, parseInt(req.body.estoqueAtual || '0', 10) || 0), estoqueMinimo: Math.max(0, parseInt(req.body.estoqueMinimo || '0', 10) || 0) }, include: INCLUDE_PADRAO })
  res.status(201).json(formatar(produto))
}
export async function atualizar(req, res) {
  const { id } = req.params
  const existente = await prisma.produto.findFirst({ where: { id, estabelecimentoId: req.estabelecimentoId } })
  if (!existente) throw new ApiError(404, 'Produto não encontrado.')
  const { nome, descricao, categoriaId, emoji, disponibilidadeInicio, disponibilidadeFim } = req.body
  if (categoriaId) { const cat = await prisma.categoria.findFirst({ where: { id: categoriaId, estabelecimentoId: req.estabelecimentoId } }); if (!cat) throw new ApiError(400, 'Categoria inválida.') }
  const precoInformado = req.body.preco !== undefined ? Number(req.body.preco) : undefined
  const data = { ...(nome !== undefined && { nome }), ...(descricao !== undefined && { descricao }), ...(categoriaId !== undefined && { categoriaId }), ...(emoji !== undefined && { emoji }), ...(disponibilidadeInicio !== undefined && { disponibilidadeInicio }), ...(disponibilidadeFim !== undefined && { disponibilidadeFim }), ...(precoInformado !== undefined && !Number.isNaN(precoInformado) && { preco: precoInformado }), ...(req.body.controlaEstoque !== undefined && { controlaEstoque: req.body.controlaEstoque === 'true' || req.body.controlaEstoque === true }), ...(req.body.estoqueAtual !== undefined && { estoqueAtual: Math.max(0, parseInt(req.body.estoqueAtual, 10) || 0) }), ...(req.body.estoqueMinimo !== undefined && { estoqueMinimo: Math.max(0, parseInt(req.body.estoqueMinimo, 10) || 0) }) }
  const imagem = resolverImagemUrl(req); if (imagem !== undefined) data.imagemUrl = imagem
  const produto = await prisma.produto.update({ where: { id }, data, include: INCLUDE_PADRAO })
  res.json(formatar(produto))
}
export async function alternarAtivo(req, res) { const atual = await prisma.produto.findFirst({ where: { id: req.params.id, estabelecimentoId: req.estabelecimentoId }, select: { ativo: true } }); if (!atual) throw new ApiError(404, 'Produto não encontrado.'); const produto = await prisma.produto.update({ where: { id: req.params.id }, data: { ativo: !atual.ativo }, include: INCLUDE_PADRAO }); res.json(formatar(produto)) }
export async function remover(req, res) { const existente = await prisma.produto.findFirst({ where: { id: req.params.id, estabelecimentoId: req.estabelecimentoId } }); if (!existente) throw new ApiError(404, 'Produto não encontrado.'); await prisma.produto.delete({ where: { id: req.params.id } }); res.status(204).send() }
