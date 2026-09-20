import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

export async function tenantContext(req, res, next) {
  try {
    const id = req.headers['x-estabelecimento-id'] || req.query.estabelecimentoId || process.env.ESTABELECIMENTO_ID || 'default'
    const estabelecimento = await prisma.estabelecimento.findFirst({ where: { ativo: true, OR: [{ id }, { slug: id }] } })
    if (!estabelecimento) throw new ApiError(400, 'Estabelecimento não encontrado ou inativo.')
    req.estabelecimentoId = estabelecimento.id
    req.estabelecimento = estabelecimento
    next()
  } catch (err) { next(err) }
}
