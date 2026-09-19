import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

// Usado pela tela de Pagamento no checkout, ao digitar um código.
export async function validar(req, res) {
  const { codigo, subtotal } = req.body
  const cupom = await prisma.cupom.findUnique({ where: { codigo: (codigo ?? '').toUpperCase() } })

  if (!cupom || !cupom.ativo) throw new ApiError(404, 'Cupom inválido ou expirado.')
  if (cupom.validoAte && new Date() > cupom.validoAte) throw new ApiError(400, 'Cupom expirado.')
  if (subtotal !== undefined && subtotal < Number(cupom.pedidoMinimo)) {
    throw new ApiError(400, `Pedido mínimo de R$ ${Number(cupom.pedidoMinimo).toFixed(2)} para esse cupom.`)
  }

  res.json(cupom)
}
