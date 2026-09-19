import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

async function geocodificarEstabelecimento(endereco) {
  if (!endereco?.trim()) return null
  const url = new URL(process.env.GEOCODING_URL || 'https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', `${endereco}, Brasil`)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('countrycodes', 'br')
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': process.env.GEOCODING_USER_AGENT || 'EstacaoDelivery/1.0' } })
  if (!response.ok) throw new ApiError(422, 'Não foi possível localizar o endereço do estabelecimento.')
  const [resultado] = await response.json()
  const latitude = Number(resultado?.lat); const longitude = Number(resultado?.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new ApiError(422, 'Não foi possível localizar o endereço do estabelecimento.')
  return { latitude, longitude }
}

const DADOS_PADRAO = {
  id: 'default',
  nomeEstabelecimento: 'Meu Estabelecimento',
  endereco: '',
}

export async function obter(req, res) {
  const config = await prisma.configuracao.upsert({
    where: { id: 'default' },
    update: {},
    create: DADOS_PADRAO,
  })
  res.json(config)
}

export async function atualizar(req, res) {
  const {
    nomeEstabelecimento, telefone, endereco, latitude, longitude,
    pedidoMinimo, tempoPreparoMedioMin, raioMaximoEntregaKm,
    aceitaDelivery, aceitaRetirada,
  } = req.body

  let coordenadas = null
  if (endereco !== undefined && endereco?.trim() && (latitude === undefined || longitude === undefined || latitude === null || longitude === null)) {
    coordenadas = await geocodificarEstabelecimento(endereco)
  }

  const config = await prisma.configuracao.upsert({
    where: { id: 'default' },
    update: {
      ...(nomeEstabelecimento !== undefined && { nomeEstabelecimento }),
      ...(telefone !== undefined && { telefone }),
      ...(endereco !== undefined && { endereco }),
      ...(latitude !== undefined && { latitude: latitude === null ? null : Number(latitude) }),
      ...(coordenadas && { latitude: coordenadas.latitude, longitude: coordenadas.longitude }),
      ...(longitude !== undefined && { longitude: longitude === null ? null : Number(longitude) }),
      ...(pedidoMinimo !== undefined && { pedidoMinimo: Number(pedidoMinimo) }),
      ...(tempoPreparoMedioMin !== undefined && { tempoPreparoMedioMin: Number(tempoPreparoMedioMin) }),
      ...(raioMaximoEntregaKm !== undefined && { raioMaximoEntregaKm: Number(raioMaximoEntregaKm) }),
      ...(aceitaDelivery !== undefined && { aceitaDelivery: Boolean(aceitaDelivery) }),
      ...(aceitaRetirada !== undefined && { aceitaRetirada: Boolean(aceitaRetirada) }),
    },
    create: {
      ...DADOS_PADRAO,
      nomeEstabelecimento: nomeEstabelecimento ?? DADOS_PADRAO.nomeEstabelecimento,
      telefone: telefone ?? null,
      endereco: endereco ?? '',
      ...(coordenadas && { latitude: coordenadas.latitude, longitude: coordenadas.longitude }),
      pedidoMinimo: pedidoMinimo !== undefined ? Number(pedidoMinimo) : 0,
      tempoPreparoMedioMin: tempoPreparoMedioMin !== undefined ? Number(tempoPreparoMedioMin) : 30,
      raioMaximoEntregaKm: raioMaximoEntregaKm !== undefined ? Number(raioMaximoEntregaKm) : 12,
      aceitaDelivery: aceitaDelivery !== undefined ? Boolean(aceitaDelivery) : true,
      aceitaRetirada: aceitaRetirada !== undefined ? Boolean(aceitaRetirada) : true,
    },
  })
  res.json(config)
}
