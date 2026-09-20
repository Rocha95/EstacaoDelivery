import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { geocodificarEndereco, calcularDistanciaRotaKm } from '../utils/geocoding.js'

const cacheGeocodificacao = new Map()
const CACHE_MS = 5 * 60 * 1000

async function obterCoordenadasEstabelecimento(config) {
  const enderecoTexto = String(config.endereco || '').trim()
  if (!enderecoTexto) throw new ApiError(422, 'O endereço do estabelecimento não está configurado.')

  const agora = Date.now()
  const cache = cacheGeocodificacao.get(`estabelecimento:${enderecoTexto}`)
  if (cache && agora - cache.timestamp < CACHE_MS) return cache.coordenadas

  // Regeocodifica o endereço salvo para evitar usar coordenadas antigas
  // de uma configuração alterada anteriormente. O resultado é cacheado
  // por alguns minutos para não consultar o serviço externo a cada pedido.
  try {
    const localizado = await geocodificarEndereco({ rua: enderecoTexto })
    const coordenadas = { latitude: localizado.latitude, longitude: localizado.longitude }
    cacheGeocodificacao.set(`estabelecimento:${enderecoTexto}`, { timestamp: agora, coordenadas })
    await prisma.configuracao.update({
      where: { id: 'default' },
      data: { latitude: coordenadas.latitude, longitude: coordenadas.longitude },
    })
    return coordenadas
  } catch (error) {
    if (Number.isFinite(Number(config.latitude)) && Number.isFinite(Number(config.longitude))) {
      return { latitude: Number(config.latitude), longitude: Number(config.longitude) }
    }
    throw error
  }
}

async function obterDistanciaDoEndereco(endereco, config) {
  let latitude = endereco.latitude
  let longitude = endereco.longitude
  const deveRevalidarDestino = process.env.REVALIDAR_COORDENADAS_ENDERECO === 'true'

  if (deveRevalidarDestino || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    const chave = `destino:${endereco.id}:${endereco.rua}:${endereco.numero || ''}:${endereco.bairro}:${endereco.cidade}:${endereco.estado}:${endereco.cep || ''}`
    const agora = Date.now()
    const cache = cacheGeocodificacao.get(chave)
    const localizado = cache && agora - cache.timestamp < CACHE_MS
      ? cache.coordenadas
      : await geocodificarEndereco(endereco)

    if (!cache || agora - cache.timestamp >= CACHE_MS) {
      cacheGeocodificacao.set(chave, { timestamp: agora, coordenadas: localizado })
    }

    latitude = localizado.latitude
    longitude = localizado.longitude
    await prisma.endereco.update({
      where: { id: endereco.id },
      data: { latitude, longitude },
    })
  }

  const estabelecimento = await obterCoordenadasEstabelecimento(config)
  const distanciaKm = await calcularDistanciaRotaKm(
    { latitude: estabelecimento.latitude, longitude: estabelecimento.longitude },
    { latitude, longitude },
  )

  if (distanciaKm === null) throw new ApiError(422, 'Não foi possível calcular a distância do endereço.')

  if (Number(endereco.distanciaKm) !== distanciaKm) {
    await prisma.endereco.update({ where: { id: endereco.id }, data: { distanciaKm } })
  }

  return distanciaKm
}

export async function calcular(req, res) {
  const enderecoId = req.query.enderecoId
  if (!enderecoId) throw new ApiError(400, 'Informe o endereço de entrega.')

  const [endereco, config, faixas] = await Promise.all([
    prisma.endereco.findFirst({ where: { id: enderecoId, usuarioId: req.usuario.id } }),
    prisma.configuracao.findUnique({ where: { id: 'default' } }),
    prisma.faixaTaxaEntrega.findMany({ orderBy: { ateKm: 'asc' } }),
  ])

  if (!endereco) throw new ApiError(404, 'Endereço de entrega não encontrado.')
  if (!config) throw new ApiError(400, 'Configuração do estabelecimento não encontrada.')

  const distanciaKm = await obterDistanciaDoEndereco(endereco, config)

  if (distanciaKm > config.raioMaximoEntregaKm) {
    return res.json({ dentroDoRaio: false, valor: null, distanciaKm })
  }

  const faixa = faixas.find((f) => distanciaKm <= Number(f.ateKm)) ?? faixas.at(-1)
  res.json({
    dentroDoRaio: true,
    valor: faixa ? Number(faixa.valor) : 0,
    distanciaKm,
  })
}

export { obterDistanciaDoEndereco }
