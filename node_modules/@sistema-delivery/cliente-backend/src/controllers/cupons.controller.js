import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

export async function validar(req, res) {
  const codigo = String(req.body.codigo ?? '').trim().toUpperCase()
  if (!codigo) throw new ApiError(400, 'Informe o código do cupom.')

  const cupom = await prisma.cupom.findFirst({ where: { codigo, estabelecimentoId: req.estabelecimentoId } })
  if (!cupom || !cupom.ativo) throw new ApiError(404, 'Cupom inválido ou inativo.')
  if (cupom.validoAte && new Date() > cupom.validoAte) throw new ApiError(400, 'Cupom expirado.')

  const subtotal = req.body.subtotal === undefined ? null : Number(req.body.subtotal)
  if (subtotal !== null && (!Number.isFinite(subtotal) || subtotal < Number(cupom.pedidoMinimo))) {
    throw new ApiError(400, `Pedido mínimo de R$ ${Number(cupom.pedidoMinimo).toFixed(2)} para esse cupom.`)
  }

  res.json(cupom)
}
