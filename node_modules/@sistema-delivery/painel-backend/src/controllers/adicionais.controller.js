import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3333}`

function resolverImagemUrl(req) {
  if (req.file) return `${BASE_URL}/uploads/adicionais/${req.file.filename}`
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
    grupo: opcao.grupo?.nome ?? 'Outros',
    grupoId: opcao.grupoId,
  }
}

// ---- Endpoints planos usados pela tela do painel (GET/POST/PATCH/DELETE /api/adicionais) ----

export async function listar(req, res) {
  const opcoes = await prisma.opcaoAdicional.findMany({
    include: { grupo: true },
    orderBy: { nome: 'asc' },
  })
  res.json(opcoes.map(formatarFlat))
}

// Cria (ou reaproveita, se já existir com esse nome) o grupo e a opção nele.
export async function criar(req, res) {
  const { nome } = req.body
  if (!nome) throw new ApiError(400, 'Informe o nome do adicional.')

  const preco = req.body.preco !== undefined ? Number(req.body.preco) : 0
  const ativo = req.body.ativo === undefined ? true : req.body.ativo === 'true' || req.body.ativo === true
  let grupo
  if (req.body.grupoId) {
    grupo = await prisma.grupoAdicional.findUnique({ where: { id: req.body.grupoId } })
    if (!grupo) throw new ApiError(400, 'Grupo de adicionais não encontrado.')
  } else {
    grupo = await encontrarOuCriarGrupo(req.body.grupo)
  }

  const opcao = await prisma.opcaoAdicional.create({
    data: {
      nome,
      preco: Number.isNaN(preco) ? 0 : preco,
      ativo,
      grupoId: grupo.id,
      imagemUrl: resolverImagemUrl(req),
    },
    include: { grupo: true },
  })
  res.status(201).json(formatarFlat(opcao))
}

// Atualização parcial — usada tanto pelo toggle (só manda { ativo }) quanto
// por uma futura edição completa (nome, preço, grupo, foto).
export async function atualizar(req, res) {
  const { id } = req.params
  const data = {}

  if (req.body.nome !== undefined) data.nome = req.body.nome
  if (req.body.preco !== undefined) data.preco = Number(req.body.preco)
  if (req.body.ativo !== undefined) data.ativo = req.body.ativo === 'true' || req.body.ativo === true

  const novaImagem = resolverImagemUrl(req)
  if (novaImagem !== undefined) data.imagemUrl = novaImagem

  if (req.body.grupoId) {
    const grupo = await prisma.grupoAdicional.findUnique({ where: { id: req.body.grupoId } })
    if (!grupo) throw new ApiError(400, 'Grupo de adicionais não encontrado.')
    data.grupoId = grupo.id
  } else if (req.body.grupo) {
    const grupo = await encontrarOuCriarGrupo(req.body.grupo)
    data.grupoId = grupo.id
  }

  const opcao = await prisma.opcaoAdicional.update({ where: { id }, data, include: { grupo: true } })
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
