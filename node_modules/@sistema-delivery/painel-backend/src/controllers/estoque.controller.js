import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

export async function listar(req, res) {
  const produtos = await prisma.produto.findMany({ where: { estabelecimentoId: req.estabelecimentoId, controlaEstoque: true }, select: { id: true, nome: true, estoqueAtual: true, estoqueMinimo: true, ativo: true, imagemUrl: true, categoria: { select: { nome: true } } }, orderBy: { nome: 'asc' } })
  res.json(produtos.map(p => ({ ...p, baixo: p.estoqueAtual <= p.estoqueMinimo })))
}

export async function movimentar(req, res) {
  const { id } = req.params
  const { tipo = 'AJUSTE', quantidade, motivo } = req.body
  const qtd = Math.abs(Number(quantidade))
  if (!Number.isInteger(qtd) || qtd < 1) throw new ApiError(400, 'Informe uma quantidade inteira maior que zero.')
  if (!['ENTRADA','SAIDA','AJUSTE'].includes(tipo)) throw new ApiError(400, 'Tipo de movimentação inválido.')

  const resultado = await prisma.$transaction(async (tx) => {
    const produto = await tx.produto.findFirst({ where: { id, estabelecimentoId: req.estabelecimentoId } })
    if (!produto) throw new ApiError(404, 'Produto não encontrado.')
    const saldoAnterior = produto.estoqueAtual
    const saldoPosterior = tipo === 'ENTRADA' ? saldoAnterior + qtd : tipo === 'SAIDA' ? saldoAnterior - qtd : qtd
    if (saldoPosterior < 0) throw new ApiError(400, `Estoque insuficiente para ${produto.nome}.`)
    await tx.produto.update({ where: { id }, data: { controlaEstoque: true, estoqueAtual: saldoPosterior } })
    return tx.estoqueMovimento.create({ data: { produtoId: id, tipo, quantidade: qtd, saldoAnterior, saldoPosterior, motivo: motivo?.trim() || null } })
  })
  res.json(resultado)
}

export async function historico(req, res) {
  const produto = await prisma.produto.findFirst({ where: { id: req.params.id, estabelecimentoId: req.estabelecimentoId }, select: { id: true } })
  if (!produto) throw new ApiError(404, 'Produto não encontrado.')
  const movimentos = await prisma.estoqueMovimento.findMany({ where: { produtoId: produto.id }, orderBy: { criadoEm: 'desc' }, take: 100 })
  res.json(movimentos)
}
