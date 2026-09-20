import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'


function imagemPublica(imagemUrl) {
  if (!imagemUrl) return null
  if (/^https?:\/\//i.test(imagemUrl)) return imagemUrl
  return `${imagemUrl.startsWith('/') ? '' : '/'}${imagemUrl}`
}

// Só o que o cliente pode ver: categorias ativas e produtos ativos.
// Os adicionais seguem a mesma Categoria do produto; não existe grupo separado no cardápio.
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
      categoria: { include: { adicionais: { where: { ativo: true }, orderBy: { nome: 'asc' } } } },
    },
    orderBy: { nome: 'asc' },
  })

  res.json(produtos.map((p) => ({
    ...p,
    categoriaNome: p.categoria?.nome,
    imagemUrl: imagemPublica(p.imagemUrl),
    gruposAdicionais: p.categoria ? [{ id: p.categoria.id, nome: p.categoria.nome, maximoSelecao: (p.categoria.adicionais || []).length, obrigatorio: false, opcoes: (p.categoria.adicionais || []).map((a) => ({ ...a, imagemUrl: imagemPublica(a.imagemUrl) })) }] : [],
  })))
}

export async function obterProduto(req, res) {
  const produto = await prisma.produto.findFirst({
    where: { id: req.params.id, ativo: true, categoria: { ativa: true } },
    include: {
      categoria: { include: { adicionais: { where: { ativo: true }, orderBy: { nome: 'asc' } } } },
    },
  })
  if (!produto) throw new ApiError(404, 'Produto não encontrado ou indisponível.')

  res.json({
    ...produto,
    categoriaNome: produto.categoria?.nome,
    imagemUrl: imagemPublica(produto.imagemUrl),
    gruposAdicionais: produto.categoria ? [{ id: produto.categoria.id, nome: produto.categoria.nome, maximoSelecao: (produto.categoria.adicionais || []).length, obrigatorio: false, opcoes: (produto.categoria.adicionais || []).map((a) => ({ ...a, imagemUrl: imagemPublica(a.imagemUrl) })) }] : [],
  })
}

export async function listarCombos(req, res) {
  const combos = await prisma.combo.findMany({
    where: { ativo: true },
    include: { itens: { include: { produto: true } } },
  })
  res.json(combos.map((c) => ({
    ...c,
    imagemUrl: imagemPublica(c.imagemUrl),
    itens: (c.itens || []).map((item) => ({
      ...item,
      produto: item.produto ? { ...item.produto, imagemUrl: imagemPublica(item.produto.imagemUrl) } : item.produto,
    })),
  })))
}
