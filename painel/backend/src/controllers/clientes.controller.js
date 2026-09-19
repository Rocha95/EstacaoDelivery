import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

export async function listar(req, res) {
  const { busca } = req.query
  const clientes = await prisma.usuario.findMany({
    where: {
      tipo: 'CLIENTE',
      nome: busca ? { contains: busca, mode: 'insensitive' } : undefined,
    },
    select: {
      id: true, nome: true, telefone: true, email: true,
      pedidos: { select: { total: true, criadoEm: true }, where: { status: { not: 'CANCELADO' } } },
    },
    orderBy: { nome: 'asc' },
  })

  const resultado = clientes.map((c) => {
    const gasto = c.pedidos.reduce((s, p) => s + Number(p.total), 0)
    const ultimoPedido = c.pedidos.reduce((max, p) => (!max || p.criadoEm > max ? p.criadoEm : max), null)
    return {
      id: c.id, nome: c.nome, telefone: c.telefone, email: c.email,
      pedidos: c.pedidos.length, gasto, ultimoPedido,
    }
  })
  res.json(resultado)
}

export async function obter(req, res) {
  const cliente = await prisma.usuario.findFirst({
    where: { id: req.params.id, tipo: 'CLIENTE' },
    include: {
      enderecos: true,
      pedidos: { orderBy: { criadoEm: 'desc' }, include: { itens: true } },
    },
  })
  if (!cliente) throw new ApiError(404, 'Cliente não encontrado.')
  res.json(cliente)
}
