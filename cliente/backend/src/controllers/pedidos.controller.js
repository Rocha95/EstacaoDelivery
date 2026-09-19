import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const INCLUDE_PADRAO = {
  endereco: true,
  cupom: true,
  itens: { include: { produto: true, combo: true, adicionais: true } },
}

// Checkout: gera o pedido a partir do carrinho montado no app do cliente.
export async function criar(req, res) {
  const {
    clienteId, tipoEntrega, enderecoId, formaPagamento,
    itens, cupomId, subtotal, taxaEntrega, desconto, total, observacoes,
  } = req.body

  if (!clienteId || !tipoEntrega || !formaPagamento || !itens?.length) {
    throw new ApiError(400, 'Informe cliente, tipo de entrega, forma de pagamento e ao menos um item.')
  }
  if (tipoEntrega === 'DELIVERY' && !enderecoId) {
    throw new ApiError(400, 'Informe o endereço de entrega.')
  }

  const pedido = await prisma.pedido.create({
    data: {
      clienteId,
      tipoEntrega,
      enderecoId: tipoEntrega === 'DELIVERY' ? enderecoId : null,
      formaPagamento,
      cupomId: cupomId || null,
      subtotal, taxaEntrega: taxaEntrega ?? 0, desconto: desconto ?? 0, total,
      observacoes,
      itens: {
        create: itens.map((item) => ({
          produtoId: item.produtoId ?? null,
          comboId: item.comboId ?? null,
          nome: item.nome,
          precoUnitario: item.precoUnitario,
          quantidade: item.quantidade ?? 1,
          adicionais: item.adicionais?.length
            ? { create: item.adicionais.map((a) => ({ opcaoId: a.opcaoId, nome: a.nome, preco: a.preco })) }
            : undefined,
        })),
      },
    },
    include: INCLUDE_PADRAO,
  })
  res.status(201).json(pedido)
}

// Tela de Histórico: pedidos do próprio cliente.
export async function meusPedidos(req, res) {
  const { clienteId } = req.query
  if (!clienteId) throw new ApiError(400, 'Informe clienteId.')

  const pedidos = await prisma.pedido.findMany({
    where: { clienteId },
    include: INCLUDE_PADRAO,
    orderBy: { criadoEm: 'desc' },
  })
  res.json(pedidos)
}

// Tela de Acompanhamento.
export async function obter(req, res) {
  const pedido = await prisma.pedido.findUnique({ where: { id: req.params.id }, include: INCLUDE_PADRAO })
  if (!pedido) throw new ApiError(404, 'Pedido não encontrado.')
  res.json(pedido)
}
