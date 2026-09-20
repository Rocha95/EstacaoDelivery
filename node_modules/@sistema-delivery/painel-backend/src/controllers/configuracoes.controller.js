import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

function textoEndereco(dados = {}) {
  const rua = String(dados.enderecoRua || '').trim()
  const numero = String(dados.enderecoNumero || '').trim()
  const bairro = String(dados.enderecoBairro || '').trim()
  const cidade = String(dados.enderecoCidade || '').trim()
  const estado = String(dados.enderecoEstado || '').trim()
  const cep = String(dados.enderecoCep || '').trim()

  return [
    rua ? `${rua}${numero ? `, ${numero}` : ''}` : '',
    bairro,
    cidade && estado ? `${cidade} - ${estado}` : cidade || estado,
    cep,
    'Brasil',
  ].filter(Boolean).join(', ')
}

export function montarEnderecoGeocodificacao(config = {}) {
  const estruturado = textoEndereco(config)
  return estruturado || String(config.endereco || '').trim()
}

export async function geocodificarEstabelecimento(enderecoOuConfig) {
  const endereco = typeof enderecoOuConfig === 'string'
    ? enderecoOuConfig.trim()
    : montarEnderecoGeocodificacao(enderecoOuConfig)

  if (!endereco) return null

  const url = new URL(process.env.GEOCODING_URL || 'https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', endereco)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('countrycodes', 'br')
  url.searchParams.set('addressdetails', '1')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'User-Agent': process.env.GEOCODING_USER_AGENT || 'EstacaoDelivery/1.0' },
    })
    if (!response.ok) return null
    const [resultado] = await response.json()
    const latitude = Number(resultado?.lat)
    const longitude = Number(resultado?.lon)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
    return { latitude, longitude }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

const DADOS_PADRAO = {
  id: 'default',
  nomeEstabelecimento: 'Meu Estabelecimento',
  endereco: '',
  enderecoRua: null,
  enderecoNumero: null,
  enderecoBairro: null,
  enderecoCidade: null,
  enderecoEstado: null,
  enderecoCep: null,
}

export async function obter(req, res) {
  const config = await prisma.configuracao.upsert({ where: { id: 'default' }, update: {}, create: DADOS_PADRAO })
  res.json(config)
}

export async function atualizar(req, res) {
  const {
    nomeEstabelecimento, telefone,
    endereco, enderecoRua, enderecoNumero, enderecoBairro, enderecoCidade, enderecoEstado, enderecoCep,
    latitude, longitude, pedidoMinimo, tempoPreparoMedioMin, raioMaximoEntregaKm,
    aceitaDelivery, aceitaRetirada,
  } = req.body

  const possuiCamposEstruturados = [enderecoRua, enderecoNumero, enderecoBairro, enderecoCidade, enderecoEstado, enderecoCep].some((v) => v !== undefined)
  const enderecoAtualizado = possuiCamposEstruturados
    ? textoEndereco({ enderecoRua, enderecoNumero, enderecoBairro, enderecoCidade, enderecoEstado, enderecoCep })
    : endereco !== undefined ? String(endereco || '').trim() : undefined

  let coordenadas
  let aviso = null

  if (enderecoAtualizado !== undefined) {
    if (!enderecoAtualizado) {
      coordenadas = { latitude: null, longitude: null }
    } else if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
      coordenadas = { latitude: Number(latitude), longitude: Number(longitude) }
    } else {
      coordenadas = await geocodificarEstabelecimento({
        endereco: enderecoAtualizado,
        enderecoRua,
        enderecoNumero,
        enderecoBairro,
        enderecoCidade,
        enderecoEstado,
        enderecoCep,
      })
      if (!coordenadas) {
        coordenadas = { latitude: null, longitude: null }
        aviso = 'Endereço salvo, mas não foi possível localizar as coordenadas automaticamente. Confira os dados do endereço.'
      }
    }
  } else if (latitude !== undefined || longitude !== undefined) {
    coordenadas = {
      latitude: latitude === null ? null : Number(latitude),
      longitude: longitude === null ? null : Number(longitude),
    }
  }

  const dadosEndereco = possuiCamposEstruturados ? {
    endereco: enderecoAtualizado || '',
    enderecoRua: enderecoRua === undefined ? null : String(enderecoRua || '').trim() || null,
    enderecoNumero: enderecoNumero === undefined ? null : String(enderecoNumero || '').trim() || null,
    enderecoBairro: enderecoBairro === undefined ? null : String(enderecoBairro || '').trim() || null,
    enderecoCidade: enderecoCidade === undefined ? null : String(enderecoCidade || '').trim() || null,
    enderecoEstado: enderecoEstado === undefined ? null : String(enderecoEstado || '').trim().toUpperCase() || null,
    enderecoCep: enderecoCep === undefined ? null : String(enderecoCep || '').trim() || null,
  } : enderecoAtualizado !== undefined ? { endereco: enderecoAtualizado } : {}

  const config = await prisma.configuracao.upsert({
    where: { id: 'default' },
    update: {
      ...(nomeEstabelecimento !== undefined && { nomeEstabelecimento: String(nomeEstabelecimento).trim() }),
      ...(telefone !== undefined && { telefone: String(telefone).trim() || null }),
      ...dadosEndereco,
      ...(coordenadas !== undefined && { latitude: coordenadas.latitude, longitude: coordenadas.longitude }),
      ...(pedidoMinimo !== undefined && { pedidoMinimo: Number(pedidoMinimo) || 0 }),
      ...(tempoPreparoMedioMin !== undefined && { tempoPreparoMedioMin: Number(tempoPreparoMedioMin) || 0 }),
      ...(raioMaximoEntregaKm !== undefined && { raioMaximoEntregaKm: Number(raioMaximoEntregaKm) || 0 }),
      ...(aceitaDelivery !== undefined && { aceitaDelivery: Boolean(aceitaDelivery) }),
      ...(aceitaRetirada !== undefined && { aceitaRetirada: Boolean(aceitaRetirada) }),
    },
    create: {
      ...DADOS_PADRAO,
      nomeEstabelecimento: nomeEstabelecimento ?? DADOS_PADRAO.nomeEstabelecimento,
      telefone: telefone ?? null,
      ...dadosEndereco,
      ...(coordenadas !== undefined && { latitude: coordenadas.latitude, longitude: coordenadas.longitude }),
      pedidoMinimo: pedidoMinimo !== undefined ? Number(pedidoMinimo) || 0 : 0,
      tempoPreparoMedioMin: tempoPreparoMedioMin !== undefined ? Number(tempoPreparoMedioMin) || 0 : 30,
      raioMaximoEntregaKm: raioMaximoEntregaKm !== undefined ? Number(raioMaximoEntregaKm) || 0 : 12,
      aceitaDelivery: aceitaDelivery !== undefined ? Boolean(aceitaDelivery) : true,
      aceitaRetirada: aceitaRetirada !== undefined ? Boolean(aceitaRetirada) : true,
    },
  })

  res.json(aviso ? { ...config, aviso } : config)
}
