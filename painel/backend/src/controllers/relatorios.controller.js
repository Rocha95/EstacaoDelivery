import { prisma } from '../lib/prisma.js'

function inicioDoDia(data) {
  const d = new Date(data)
  d.setHours(0, 0, 0, 0)
  return d
}

// Cards de topo do Dashboard e da tela de Relatórios.
export async function resumo(req, res) {
  const dias = Number(req.query.dias ?? 7)
  const desde = inicioDoDia(new Date(Date.now() - dias * 24 * 60 * 60 * 1000))

  const pedidos = await prisma.pedido.findMany({
    where: { estabelecimentoId: req.estabelecimentoId, criadoEm: { gte: desde } },
    select: { total: true, status: true },
  })

  const validos = pedidos.filter((p) => p.status !== 'CANCELADO')
  const faturamento = validos.reduce((s, p) => s + Number(p.total), 0)
  const cancelamentos = pedidos.length - validos.length

  res.json({
    periodoDias: dias,
    totalPedidos: pedidos.length,
    faturamento,
    cancelamentos,
    ticketMedio: validos.length ? faturamento / validos.length : 0,
  })
}

// Gráfico de barras "Faturamento por dia".
export async function vendasPorDia(req, res) {
  const dias = Number(req.query.dias ?? 7)
  const desde = inicioDoDia(new Date(Date.now() - (dias - 1) * 24 * 60 * 60 * 1000))

  const pedidos = await prisma.pedido.findMany({
    where: { estabelecimentoId: req.estabelecimentoId, criadoEm: { gte: desde }, status: { not: 'CANCELADO' } },
    select: { total: true, criadoEm: true },
  })

  const porDia = {}
  for (let i = 0; i < dias; i++) {
    const dia = new Date(desde.getTime() + i * 24 * 60 * 60 * 1000)
    porDia[dia.toISOString().slice(0, 10)] = 0
  }
  for (const p of pedidos) {
    const chave = p.criadoEm.toISOString().slice(0, 10)
    if (chave in porDia) porDia[chave] += Number(p.total)
  }

  res.json(Object.entries(porDia).map(([data, valor]) => ({ data, valor })))
}

// Ranking "Mais vendidos" — soma quantidade por nome de item vendido.
export async function maisVendidos(req, res) {
  const limite = Number(req.query.limite ?? 5)
  const itens = await prisma.itemPedido.findMany({ where: { pedido: { estabelecimentoId: req.estabelecimentoId, status: { not: 'CANCELADO' } } }, select: { nome: true, quantidade: true } })
  const mapa = new Map()
  for (const i of itens) mapa.set(i.nome, (mapa.get(i.nome) || 0) + i.quantidade)
  res.json([...mapa.entries()].sort((a,b)=>b[1]-a[1]).slice(0, limite).map(([nome, quantidade])=>({nome, quantidade})))
}
