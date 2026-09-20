import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'


function resolverImagemUrl(req) {
  if (req.file) return `/uploads/adicionais/${req.file.filename}`
  if (req.body.imagemUrl) return req.body.imagemUrl
  return undefined
}

async function encontrarOuCriarGrupo(nome) {
  const nomeFinal = (nome || '').trim() || 'Outros'
  const existente = await prisma.grupoAdicional.findFirst({ where: { nome: nomeFinal } })
  if (existente) return existente
  return prisma.grupoAdicional.create({ data: { nome: nomeFinal } })
}

function formatarFlat(opcao) {
  return {
    id: opcao.id,
    nome: opcao.nome,
    preco: opcao.preco,
    ativo: opcao.ativo,
    imagemUrl: opcao.imagemUrl,
    categoria: opcao.categoria?.nome ?? null,
    categoriaId: opcao.categoriaId ?? null,
  }
}

// ---- Endpoints planos usados pela tela do painel (GET/POST/PATCH/DELETE /api/adicionais) ----

export async function listar(req, res) {
  const opcoes = await prisma.opcaoAdicional.findMany({
    include: { categoria: true },
    orderBy: { nome: 'asc' },
  })
  res.json(opcoes.map(formatarFlat))
}

export async function criar(req, res) {
  const { nome, categoriaId } = req.body
  if (!nome) throw new ApiError(400, 'Informe o nome do adicional.')
  if (!categoriaId) throw new ApiError(400, 'Selecione a categoria do adicional.')

  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } })
  if (!categoria || !categoria.ativa) throw new ApiError(400, 'Categoria não encontrada ou inativa.')

  const preco = req.body.preco !== undefined ? Number(req.body.preco) : 0
  const ativo = req.body.ativo === undefined ? true : req.body.ativo === 'true' || req.body.ativo === true

  const opcao = await prisma.opcaoAdicional.create({
    data: {
      nome: nome.trim(),
      preco: Number.isNaN(preco) ? 0 : preco,
      ativo,
      categoriaId: categoria.id,
      imagemUrl: resolverImagemUrl(req),
    },
    include: { categoria: true },
  })
  res.status(201).json(formatarFlat(opcao))
}

export async function atualizar(req, res) {
  const { id } = req.params
  const data = {}

  if (req.body.nome !== undefined) data.nome = req.body.nome.trim()
  if (req.body.preco !== undefined) {
    const preco = Number(req.body.preco)
    if (Number.isNaN(preco)) throw new ApiError(400, 'Preço inválido.')
    data.preco = preco
  }
  if (req.body.ativo !== undefined) data.ativo = req.body.ativo === 'true' || req.body.ativo === true

  if (req.body.categoriaId !== undefined) {
    const categoria = await prisma.categoria.findUnique({ where: { id: req.body.categoriaId } })
    if (!categoria || !categoria.ativa) throw new ApiError(400, 'Categoria não encontrada ou inativa.')
    data.categoriaId = categoria.id
  }

  const novaImagem = resolverImagemUrl(req)
  if (novaImagem !== undefined) data.imagemUrl = novaImagem

  const opcao = await prisma.opcaoAdicional.update({ where: { id }, data, include: { categoria: true } })
  res.json(formatarFlat(opcao))
}

export async function removerFlat(req, res) {
  await prisma.opcaoAdicional.delete({ where: { id: req.params.id } })
  res.status(204).send()
}

// ---- Endpoints relacionais (grupos/opções) — usados por outras telas, mantidos como estavam ----

export async function listarGrupos(req, res) {
  const grupos = await prisma.grupoAdicional.findMany({
    include: { opcoes: true },
    orderBy: { nome: 'asc' },
  })
  res.json(grupos)
}

export async function criarGrupo(req, res) {
  const { nome, maximoSelecao, obrigatorio, opcoes } = req.body
  if (!nome) throw new ApiError(400, 'Informe o nome do grupo de adicionais.')

  const grupo = await prisma.grupoAdicional.create({
    data: {
      nome,
      maximoSelecao: maximoSelecao ?? 1,
      obrigatorio: obrigatorio ?? false,
      opcoes: opcoes?.length ? { create: opcoes.map((o) => ({ nome: o.nome, preco: o.preco ?? 0 })) } : undefined,
    },
    include: { opcoes: true },
  })
  res.status(201).json(grupo)
}

export async function atualizarGrupo(req, res) {
  const { id } = req.params
  const { nome, maximoSelecao, obrigatorio } = req.body
  const grupo = await prisma.grupoAdicional.update({
    where: { id },
    data: { nome, maximoSelecao, obrigatorio },
    include: { opcoes: true },
  })
  res.json(grupo)
}

export async function removerGrupo(req, res) {
  await prisma.grupoAdicional.delete({ where: { id: req.params.id } })
  res.status(204).send()
}

export async function criarOpcao(req, res) {
  const { grupoId } = req.params
  const { nome, preco } = req.body
  if (!nome) throw new ApiError(400, 'Informe o nome do adicional.')

  const opcao = await prisma.opcaoAdicional.create({
    data: { nome, preco: preco ?? 0, grupoId },
  })
  res.status(201).json(opcao)
}

export async function atualizarOpcao(req, res) {
  const { id } = req.params
  const { nome, preco } = req.body
  const opcao = await prisma.opcaoAdicional.update({ where: { id }, data: { nome, preco } })
  res.json(opcao)
}

// Corresponde ao toggle da tela de Adicionais.
export async function alternarOpcaoAtiva(req, res) {
  const { id } = req.params
  const atual = await prisma.opcaoAdicional.findUnique({ where: { id }, select: { ativo: true } })
  if (!atual) throw new ApiError(404, 'Adicional não encontrado.')

  const opcao = await prisma.opcaoAdicional.update({ where: { id }, data: { ativo: !atual.ativo } })
  res.json(opcao)
}

export async function removerOpcao(req, res) {
  await prisma.opcaoAdicional.delete({ where: { id: req.params.id } })
  res.status(204).send()
}
