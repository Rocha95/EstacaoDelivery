import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const INCLUDE_PADRAO = {
  cliente: { select: { id: true, nome: true, telefone: true } },
  endereco: true,
  cupom: true,
  itens: { include: { produto: true, combo: true, adicionais: true } },
}

// Ordem fixa do fluxo de expedição usada no Dashboard e na tela de Pedidos.
const PROXIMO_STATUS = {
  RECEBIDO: 'EM_PRODUCAO',
  EM_PRODUCAO: 'SAIU_PARA_ENTREGA',
  SAIU_PARA_ENTREGA: 'FINALIZADO',
}

const CAMPO_TIMESTAMP = {
  EM_PRODUCAO: 'producaoEm',
  SAIU_PARA_ENTREGA: 'saiuEntregaEm',
  FINALIZADO: 'finalizadoEm',
}

export async function listar(req, res) {
  const { status, busca, dataInicio, dataFim } = req.query

  const pedidos = await prisma.pedido.findMany({
    where: {
      status: status || undefined,
      criadoEm: dataInicio || dataFim ? {
        gte: dataInicio ? new Date(dataInicio) : undefined,
        lte: dataFim ? new Date(dataFim) : undefined,
      } : undefined,
      cliente: busca ? { nome: { contains: busca, mode: 'insensitive' } } : undefined,
    },
    include: INCLUDE_PADRAO,
    orderBy: { criadoEm: 'desc' },
  })
  res.json(pedidos)
}

export async function obter(req, res) {
  const pedido = await prisma.pedido.findUnique({ where: { id: req.params.id }, include: INCLUDE_PADRAO })
  if (!pedido) throw new ApiError(404, 'Pedido não encontrado.')
  res.json(pedido)
}

// Avança para a próxima estação da linha de expedição (usado pelos botões
// do Dashboard e da tela de Pedidos).
export async function avancarStatus(req, res) {
  const { id } = req.params
  const pedido = await prisma.pedido.findUnique({ where: { id }, select: { status: true } })
  if (!pedido) throw new ApiError(404, 'Pedido não encontrado.')

  const proximo = PROXIMO_STATUS[pedido.status]
  if (!proximo) throw new ApiError(400, `Pedido em "${pedido.status}" não tem próxima etapa.`)

  const atualizado = await prisma.pedido.update({
    where: { id },
    data: { status: proximo, [CAMPO_TIMESTAMP[proximo]]: new Date() },
    include: INCLUDE_PADRAO,
  })
  res.json(atualizado)
}

export async function cancelar(req, res) {
  const pedido = await prisma.pedido.update({
    where: { id: req.params.id },
    data: { status: 'CANCELADO' },
    include: INCLUDE_PADRAO,
  })
  res.json(pedido)
}
