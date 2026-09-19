import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'


function imagemPublica(imagemUrl) {
  if (!imagemUrl) return null
  if (/^https?:\/\//i.test(imagemUrl)) return imagemUrl
  const base = (process.env.PAINEL_PUBLIC_URL || 'http://localhost:3333').replace(/\/$/, '')
  return `${base}${imagemUrl.startsWith('/') ? '' : '/'}${imagemUrl}`
}

// Só o que o cliente pode ver: categorias ativas e produtos ativos,
// com os grupos de adicionais (e só as opções ativas de cada grupo).
export async function listarCategorias(req, res) {
  const categorias = await prisma.categoria.findMany({
    where: { ativa: true },
    orderBy: { ordem: 'asc' },
  })
  res.json(categorias)
}

export async function listarProdutos(req, res) {
  const { categoriaId } = req.query
  const produtos = await prisma.produto.findMany({
    where: { ativo: true, categoriaId: categoriaId || undefined, categoria: { ativa: true } },
    include: {
      categoria: true,
      gruposAdicionais: {
        include: { grupo: { include: { opcoes: { where: { ativo: true } } } } },
      },
    },
    orderBy: { nome: 'asc' },
  })

  res.json(produtos.map((p) => ({
    ...p,
    categoriaNome: p.categoria?.nome,
    imagemUrl: imagemPublica(p.imagemUrl),
    gruposAdicionais: p.gruposAdicionais.map((pg) => pg.grupo),
  })))
}

export async function obterProduto(req, res) {
  const produto = await prisma.produto.findFirst({
    where: { id: req.params.id, ativo: true },
    include: {
      categoria: true,
      gruposAdicionais: {
        include: { grupo: { include: { opcoes: { where: { ativo: true } } } } },
      },
    },
  })
  if (!produto) throw new ApiError(404, 'Produto não encontrado ou indisponível.')

  res.json({
    ...produto,
    categoriaNome: produto.categoria?.nome,
    imagemUrl: imagemPublica(produto.imagemUrl),
    gruposAdicionais: produto.gruposAdicionais.map((pg) => pg.grupo),
  })
}

export async function listarCombos(req, res) {
  const combos = await prisma.combo.findMany({
    where: { ativo: true },
    include: { itens: { include: { produto: true } } },
  })
  res.json(combos)
}
