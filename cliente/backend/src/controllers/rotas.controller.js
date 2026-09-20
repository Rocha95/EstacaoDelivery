import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { geocodificarEndereco, calcularDistanciaRotaKm } from '../utils/geocoding.js'

async function obterEstabelecimento() {
  const config = await prisma.configuracao.findUnique({ where: { id: 'default' } })
  if (!config) throw new ApiError(404, 'Configuração do estabelecimento não encontrada.')
  let { latitude, longitude } = config
  if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    const localizado = await geocodificarEndereco({ rua: config.endereco })
    latitude = localizado.latitude
    longitude = localizado.longitude
    await prisma.configuracao.update({ where: { id: 'default' }, data: { latitude, longitude } })
  }
  return { latitude, longitude, config }
}

export async function calcularParaEndereco(req, res) {
  const endereco = await prisma.endereco.findFirst({ where: { id: req.params.enderecoId, usuarioId: req.usuario.id } })
  if (!endereco) throw new ApiError(404, 'Endereço de entrega não encontrado.')

  let { latitude, longitude } = endereco
  if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    const localizado = await geocodificarEndereco(endereco)
    latitude = localizado.latitude
    longitude = localizado.longitude
    await prisma.endereco.update({ where: { id: endereco.id }, data: { latitude, longitude } })
  }

  const estabelecimento = await obterEstabelecimento()
  const distanciaKm = await calcularDistanciaRotaKm(estabelecimento, { latitude, longitude })
  res.json({
    distanciaKm,
    metodo: 'rota_rodoviaria',
    origem: estabelecimento,
    destino: { latitude, longitude },
    origemRecalculada: true,
  })
}
