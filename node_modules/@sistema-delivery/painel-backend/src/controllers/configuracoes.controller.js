import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

export async function geocodificarEstabelecimento(endereco) {
  if (!endereco?.trim()) return null
  const url = new URL(process.env.GEOCODING_URL || 'https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', `${endereco}, Brasil`)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('countrycodes', 'br')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json', 'User-Agent': process.env.GEOCODING_USER_AGENT || 'EstacaoDelivery/1.0' } })
    if (!response.ok) return null
    const [resultado] = await response.json()
    const latitude = Number(resultado?.lat); const longitude = Number(resultado?.lon)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
    return { latitude, longitude }
  } catch { return null } finally { clearTimeout(timeout) }
}

const DADOS_PADRAO = { id: 'default', nomeEstabelecimento: 'Meu Estabelecimento', endereco: '' }

export async function obter(req, res) {
  const config = await prisma.configuracao.upsert({ where: { id: 'default' }, update: {}, create: DADOS_PADRAO })
  res.json(config)
}

export async function atualizar(req, res) {
  const { nomeEstabelecimento, telefone, endereco, latitude, longitude, pedidoMinimo, tempoPreparoMedioMin, raioMaximoEntregaKm, aceitaDelivery, aceitaRetirada } = req.body
  const enderecoAlterado = endereco !== undefined
  let coordenadas = undefined
  let aviso = null

  if (enderecoAlterado) {
    if (!String(endereco || '').trim()) coordenadas = { latitude: null, longitude: null }
    else if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) coordenadas = { latitude: Number(latitude), longitude: Number(longitude) }
    else {
      coordenadas = await geocodificarEstabelecimento(endereco)
      if (!coordenadas) {
        coordenadas = { latitude: null, longitude: null }
        aviso = 'Endereço salvo, mas não foi possível localizar as coordenadas automaticamente. O cálculo de rota ficará indisponível até o endereço ser geocodificado.'
      }
    }
  } else if (latitude !== undefined || longitude !== undefined) {
    coordenadas = { latitude: latitude === null ? null : Number(latitude), longitude: longitude === null ? null : Number(longitude) }
  }

  const config = await prisma.configuracao.upsert({
    where: { id: 'default' },
    update: {
      ...(nomeEstabelecimento !== undefined && { nomeEstabelecimento }),
      ...(telefone !== undefined && { telefone }),
      ...(endereco !== undefined && { endereco }),
      ...(coordenadas !== undefined && { latitude: coordenadas.latitude, longitude: coordenadas.longitude }),
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
      ...(coordenadas !== undefined && { latitude: coordenadas.latitude, longitude: coordenadas.longitude }),
      pedidoMinimo: pedidoMinimo !== undefined ? Number(pedidoMinimo) : 0,
      tempoPreparoMedioMin: tempoPreparoMedioMin !== undefined ? Number(tempoPreparoMedioMin) : 30,
      raioMaximoEntregaKm: raioMaximoEntregaKm !== undefined ? Number(raioMaximoEntregaKm) : 12,
      aceitaDelivery: aceitaDelivery !== undefined ? Boolean(aceitaDelivery) : true,
      aceitaRetirada: aceitaRetirada !== undefined ? Boolean(aceitaRetirada) : true,
    },
  })
  res.json(aviso ? { ...config, aviso } : config)
}
