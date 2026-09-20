import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { notificarPedido } from '../services/whatsapp.js'

const INCLUDE_PADRAO = {
  cliente: { select: { id: true, nome: true, telefone: true, email: true } },
  endereco: true,
  cupom: true,
  pagamento: true,
  itens: { include: { produto: true, combo: true, adicionais: true } },
}

const PROXIMO_STATUS = { RECEBIDO: 'EM_PRODUCAO', EM_PRODUCAO: 'SAIU_PARA_ENTREGA', SAIO_PARA_ENTREGA: 'FINALIZADO', SAIU_PARA_ENTREGA: 'FINALIZADO' }
const CAMPO_TIMESTAMP = { EM_PRODUCAO: 'producaoEm', SAIU_PARA_ENTREGA: 'saiuEntregaEm', FINALIZADO: 'finalizadoEm' }

export async function listar(req, res) {
  const { status, busca, dataInicio, dataFim } = req.query
  const pedidos = await prisma.pedido.findMany({
    where: {
      estabelecimentoId: req.estabelecimentoId,
      status: status || undefined,
      criadoEm: dataInicio || dataFim ? { gte: dataInicio ? new Date(dataInicio) : undefined, lte: dataFim ? new Date(dataFim) : undefined } : undefined,
      cliente: busca ? { nome: { contains: busca, mode: 'insensitive' } } : undefined,
    },
    include: INCLUDE_PADRAO,
    orderBy: { criadoEm: 'desc' },
  })
  res.json(pedidos)
}

export async function obter(req, res) {
  const pedido = await prisma.pedido.findFirst({ where: { id: req.params.id, estabelecimentoId: req.estabelecimentoId }, include: INCLUDE_PADRAO })
  if (!pedido) throw new ApiError(404, 'Pedido não encontrado.')
  res.json(pedido)
}

export async function avancarStatus(req, res) {
  const pedido = await prisma.pedido.findFirst({ where: { id: req.params.id, estabelecimentoId: req.estabelecimentoId }, select: { status: true, agendadoPara: true, formaPagamento: true, pagamentoStatus: true, pagamento: { select: { provedor: true } } } })
  if (!pedido) throw new ApiError(404, 'Pedido não encontrado.')
  if (pedido.agendadoPara && new Date(pedido.agendadoPara).getTime() > Date.now()) throw new ApiError(400, `Este pedido está agendado para ${new Date(pedido.agendadoPara).toLocaleString('pt-BR')}.`)
  if (pedido.status === 'RECEBIDO' && pedido.formaPagamento === 'PIX' && pedido.pagamento?.provedor === 'MERCADO_PAGO' && pedido.pagamentoStatus !== 'APROVADO') throw new ApiError(400, 'Aguarde a confirmação do pagamento Pix antes de iniciar a produção.')
  const aliases = { PRODUCAO: 'EM_PRODUCAO', ENTREGA: 'SAIU_PARA_ENTREGA' }
  const solicitado = req.body?.status ? (aliases[req.body.status] || req.body.status) : null
  const proximo = PROXIMO_STATUS[pedido.status]
  if (!proximo) throw new ApiError(400, `Pedido em "${pedido.status}" não tem próxima etapa.`)
  if (solicitado && solicitado !== proximo) throw new ApiError(409, `Transição inválida: ${pedido.status} → ${solicitado}.`)

  const atualizado = await prisma.pedido.update({ where: { id: req.params.id }, data: { status: proximo, [CAMPO_TIMESTAMP[proximo]]: new Date() }, include: INCLUDE_PADRAO })

  if (proximo === 'FINALIZADO') {
    const config = await prisma.configuracao.findUnique({ where: { id: req.estabelecimentoId === 'default' ? 'default' : `config-${req.estabelecimentoId}` } })
    const pontos = Math.floor(Number(atualizado.total) * Number(config?.pontosPorReal || 1))
    if (pontos > 0) {
      const fidelidade = await prisma.fidelidade.upsert({ where: { usuarioId_estabelecimentoId: { usuarioId: atualizado.clienteId, estabelecimentoId: req.estabelecimentoId } }, update: { pontosSaldo: { increment: pontos }, pontosAcumulados: { increment: pontos } }, create: { usuarioId: atualizado.clienteId, estabelecimentoId: req.estabelecimentoId, pontosSaldo: pontos, pontosAcumulados: pontos } })
      await prisma.movimentoFidelidade.create({ data: { fidelidadeId: fidelidade.id, pedidoId: atualizado.id, tipo: 'CREDITO', pontos, descricao: `Pontos do pedido #${atualizado.numero}` } })
    }
  }

  notificarPedido(atualizado, proximo).catch(() => {})
  res.json(atualizado)
}

export async function cancelar(req, res) {
  const pedido = await prisma.pedido.findFirst({ where: { id: req.params.id, estabelecimentoId: req.estabelecimentoId } })
  if (!pedido) throw new ApiError(404, 'Pedido não encontrado.')
  if (pedido.status === 'FINALIZADO') throw new ApiError(400, 'Pedido finalizado não pode ser cancelado.')
  const atualizado = await prisma.$transaction(async (tx) => {
    const completo = await tx.pedido.findUnique({ where: { id: pedido.id }, include: { itens: { include: { combo: { include: { itens: true } }, produto: true } } } })
    for (const item of completo.itens) {
      const componentes = item.produto ? [{ produto: item.produto, quantidade: item.quantidade }] : (item.combo?.itens || []).map(ci => ({ produto: null, produtoId: ci.produtoId, quantidade: ci.quantidade * item.quantidade }))
      for (const comp of componentes) {
        const produto = comp.produto || await tx.produto.findUnique({ where: { id: comp.produtoId } })
        if (!produto?.controlaEstoque) continue
        await tx.produto.update({ where: { id: produto.id }, data: { estoqueAtual: { increment: comp.quantidade } } })
        await tx.estoqueMovimento.create({ data: { produtoId: produto.id, pedidoId: pedido.id, tipo: 'ESTORNO', quantidade: comp.quantidade, saldoAnterior: produto.estoqueAtual, saldoPosterior: produto.estoqueAtual + comp.quantidade, motivo: `Cancelamento do pedido #${pedido.id}` } })
      }
    }
    return tx.pedido.update({ where: { id: pedido.id }, data: { status: 'CANCELADO' }, include: INCLUDE_PADRAO })
  })
  notificarPedido(atualizado, 'CANCELADO').catch(() => {})
  res.json(atualizado)
}
