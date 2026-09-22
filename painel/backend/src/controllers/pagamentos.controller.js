import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { notificarPedido } from '../services/whatsapp.js'

const include = { cliente: { select: { id: true, nome: true, telefone: true, email: true } }, endereco: true, pagamento: true, itens: { include: { produto: true, combo: true, adicionais: true } } }

export async function confirmarManual(req, res) {
  const pedido = await prisma.pedido.findFirst({ where: { id: req.params.id, estabelecimentoId: req.estabelecimentoId }, include: { pagamento: true } })
  if (!pedido) throw new ApiError(404, 'Pedido não encontrado.')
  if (pedido.formaPagamento !== 'PIX' || pedido.pagamento?.provedor !== 'MANUAL') throw new ApiError(400, 'Este pedido não possui um pagamento Pix manual aguardando confirmação.')
  if (pedido.status !== 'AGUARDANDO_PAGAMENTO') throw new ApiError(409, 'Este pedido não está aguardando confirmação de pagamento.')
  if (pedido.pagamento.expiraEm && new Date(pedido.pagamento.expiraEm).getTime() <= Date.now()) throw new ApiError(409, 'O prazo de pagamento já expirou. O pedido deve ser cancelado.')

  const atualizado = await prisma.$transaction(async (tx) => {
    await tx.pagamento.update({ where: { id: pedido.pagamento.id }, data: { status: 'APROVADO' } })
    return tx.pedido.update({ where: { id: pedido.id }, data: { status: 'RECEBIDO', pagamentoStatus: 'APROVADO' }, include })
  })
  notificarPedido(atualizado, 'RECEBIDO').catch(() => {})
  res.json(atualizado)
}
