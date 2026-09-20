import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'


function imagemPublica(imagemUrl) {
  if (!imagemUrl) return null
  const valor = String(imagemUrl).trim()
  if (!valor) return null

  // Compatibilidade com imagens antigas salvas como URL absoluta do Painel.
  // O Cliente Backend serve /uploads, então normalizamos essas URLs para
  // evitar que o navegador tente acessar localhost:3333.
  if (/^https?:\/\//i.test(valor)) {
    try {
      const url = new URL(valor)
      if (url.pathname.startsWith('/uploads/')) {
        return `${url.pathname}${url.search}${url.hash}`
      }
      return valor
    } catch {
      return valor
    }
  }

  return `${valor.startsWith('/') ? '' : '/'}${valor}`
}

// Só o que o cliente pode ver: categorias ativas e produtos ativos.
// Os adicionais seguem a mesma Categoria do produto; não existe grupo separado no cardápio.
export async function listarCategorias(req, res) {
  const categorias = await prisma.categoria.findMany({
    where: { ativa: true, estabelecimentoId: req.estabelecimentoId },
    orderBy: { ordem: 'asc' },
  })
  res.json(categorias)
}

export async function listarProdutos(req, res) {
  const { categoriaId } = req.query
  const produtos = await prisma.produto.findMany({
    where: { estabelecimentoId: req.estabelecimentoId, ativo: true, categoriaId: categoriaId || undefined, categoria: { ativa: true } },
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
    where: { id: req.params.id, estabelecimentoId: req.estabelecimentoId, ativo: true, categoria: { ativa: true } },
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
    where: { ativo: true, estabelecimentoId: req.estabelecimentoId },
    include: { itens: { include: { produto: true } } },
  })
  const disponiveis = combos.filter((c) => (c.itens || []).every((item) => !item.produto?.controlaEstoque || Number(item.produto.estoqueAtual) >= Number(item.quantidade || 1)))
  res.json(disponiveis.map((c) => ({
    ...c,
    imagemUrl: imagemPublica(c.imagemUrl),
    itens: (c.itens || []).map((item) => ({
      ...item,
      produto: item.produto ? { ...item.produto, imagemUrl: imagemPublica(item.produto.imagemUrl) } : item.produto,
    })),
  })))
}
