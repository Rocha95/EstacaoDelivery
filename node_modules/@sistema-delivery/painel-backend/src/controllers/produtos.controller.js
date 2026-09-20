import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const INCLUDE_PADRAO = {
  categoria: { include: { opcoes: { where: { ativo: true } } } },
}

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3333}`

function formatar(produto) {
  return {
    ...produto,
    categoriaNome: produto.categoria?.nome,
    gruposAdicionais: produto.categoria ? [{ id: produto.categoria.id, nome: produto.categoria.nome, maximoSelecao: (p.categoria.opcoes || []).length, obrigatorio: false, opcoes: produto.categoria.opcoes || [] }] : [],
  }
}

// Se veio um arquivo (multer), monta a URL pública dele. Se não veio arquivo
// mas o campo imagemUrl foi preenchido (colar um link), usa esse. Se nada
// foi enviado, retorna undefined pra não sobrescrever o que já existia.
function resolverImagemUrl(req) {
  if (req.file) return `${BASE_URL}/uploads/produtos/${req.file.filename}`
  if (req.body.imagemUrl) return req.body.imagemUrl
  return undefined
}

export async function listar(req, res) {
  const { categoriaId, ativo } = req.query
  const produtos = await prisma.produto.findMany({
    where: {
      categoriaId: categoriaId || undefined,
      ativo: ativo === undefined ? undefined : ativo === 'true',
    },
    include: INCLUDE_PADRAO,
    orderBy: { nome: 'asc' },
  })
  res.json(produtos.map(formatar))
}

export async function obter(req, res) {
  const produto = await prisma.produto.findUnique({
    where: { id: req.params.id },
    include: INCLUDE_PADRAO,
  })
  if (!produto) throw new ApiError(404, 'Produto não encontrado.')
  res.json(formatar(produto))
}

// Recebe multipart/form-data (multer já populou req.body com os campos de
// texto como string, e req.file com a foto, se enviada).
export async function criar(req, res) {
  const { nome, descricao, categoriaId, emoji, disponibilidadeInicio, disponibilidadeFim } = req.body
  const preco = req.body.preco !== undefined ? Number(req.body.preco) : undefined
  const ativo = req.body.ativo === undefined ? true : req.body.ativo === 'true' || req.body.ativo === true

  if (!nome || preco === undefined || Number.isNaN(preco) || !categoriaId) {
    throw new ApiError(400, 'Informe nome, preço e categoria do produto.')
  }

  const produto = await prisma.produto.create({
    data: {
      nome,
      descricao,
      preco,
      emoji,
      categoriaId,
      disponibilidadeInicio,
      disponibilidadeFim,
      ativo,
      imagemUrl: resolverImagemUrl(req),
    },
    include: INCLUDE_PADRAO,
  })
  res.status(201).json(formatar(produto))
}

export async function atualizar(req, res) {
  const { id } = req.params
  const { nome, descricao, categoriaId, emoji, disponibilidadeInicio, disponibilidadeFim } = req.body
  const precoInformado = req.body.preco !== undefined ? Number(req.body.preco) : undefined

  const produto = await prisma.produto.update({
    where: { id },
    data: {
      nome,
      descricao,
      categoriaId,
      emoji,
      disponibilidadeInicio,
      disponibilidadeFim,
      preco: precoInformado === undefined || Number.isNaN(precoInformado) ? undefined : precoInformado,
      imagemUrl: resolverImagemUrl(req),
    },
    include: INCLUDE_PADRAO,
  })
  res.json(formatar(produto))
}

// Corresponde ao toggle da tela de Produtos: tira/coloca o item do
// cardápio do cliente sem apagar o cadastro.
export async function alternarAtivo(req, res) {
  const { id } = req.params
  const atual = await prisma.produto.findUnique({ where: { id }, select: { ativo: true } })
  if (!atual) throw new ApiError(404, 'Produto não encontrado.')

  const produto = await prisma.produto.update({
    where: { id },
    data: { ativo: !atual.ativo },
    include: INCLUDE_PADRAO,
  })
  res.json(formatar(produto))
}

export async function remover(req, res) {
  await prisma.produto.delete({ where: { id: req.params.id } })
  res.status(204).send()
}
