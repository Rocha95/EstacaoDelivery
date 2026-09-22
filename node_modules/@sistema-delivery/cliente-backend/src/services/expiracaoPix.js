import { prisma } from '../lib/prisma.js'

export async function cancelarPedidoPix(pedidoId, { motivo = 'Expiração do Pix', exigirExpiracao = true } = {}) {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        itens: { include: { produto: true, combo: { include: { itens: true } } } },
        pagamento: true,
      },
    })
    if (!pedido || pedido.status !== 'AGUARDANDO_PAGAMENTO') return null
    if (pedido.formaPagamento !== 'PIX') return null

    const agora = new Date()
    if (exigirExpiracao && (!pedido.pagamento?.expiraEm || pedido.pagamento.expiraEm > agora)) return null

    for (const item of pedido.itens) {
      const componentes = item.produto
        ? [{ produtoId: item.produto.id, quantidade: item.quantidade }]
        : (item.combo?.itens || []).map((ci) => ({ produtoId: ci.produtoId, quantidade: ci.quantidade * item.quantidade }))

      for (const componente of componentes) {
        const produto = await tx.produto.findUnique({ where: { id: componente.produtoId } })
        if (!produto?.controlaEstoque) continue
        await tx.produto.update({ where: { id: produto.id }, data: { estoqueAtual: { increment: componente.quantidade } } })
        await tx.estoqueMovimento.create({
          data: {
            produtoId: produto.id,
            pedidoId: pedido.id,
            tipo: 'ESTORNO',
            quantidade: componente.quantidade,
            saldoAnterior: produto.estoqueAtual,
            saldoPosterior: produto.estoqueAtual + componente.quantidade,
            motivo: `${motivo} do pedido #${pedido.numero}`,
          },
        })
      }
    }

    if (pedido.pagamento) {
      await tx.pagamento.update({ where: { id: pedido.pagamento.id }, data: { status: exigirExpiracao ? 'EXPIRADO' : 'CANCELADO' } })
    }
    return tx.pedido.update({ where: { id: pedido.id }, data: { status: 'CANCELADO', pagamentoStatus: exigirExpiracao ? 'EXPIRADO' : 'CANCELADO' } })
  })
}

export async function expirarPixPendentes() {
  const agora = new Date()
  const candidatos = await prisma.pedido.findMany({
    where: {
      status: 'AGUARDANDO_PAGAMENTO',
      formaPagamento: 'PIX',
      pagamento: { is: { status: 'PENDENTE', expiraEm: { lte: agora } } },
    },
    select: { id: true },
    take: 100,
  })

  let expirados = 0
  for (const candidato of candidatos) {
    const resultado = await cancelarPedidoPix(candidato.id)
    if (resultado) expirados += 1
  }
  return expirados
}
