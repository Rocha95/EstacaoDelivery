import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

// Usado na tela de Entrega ou retirada, ao escolher/cadastrar um endereço.
export async function calcular(req, res) {
  const distanciaKm = Number(req.query.distanciaKm)
  if (Number.isNaN(distanciaKm)) throw new ApiError(400, 'Informe distanciaKm.')

  const faixas = await prisma.faixaTaxaEntrega.findMany({ orderBy: { ateKm: 'asc' } })
  const config = await prisma.configuracao.findUnique({ where: { id: 'default' } })

  if (config && distanciaKm > config.raioMaximoEntregaKm) {
    return res.json({ dentroDoRaio: false, valor: null })
  }

  const faixa = faixas.find((f) => distanciaKm <= f.ateKm) ?? faixas[faixas.length - 1]
  res.json({ dentroDoRaio: true, valor: faixa ? Number(faixa.valor) : null })
}
