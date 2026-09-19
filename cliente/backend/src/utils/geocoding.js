import { ApiError } from './ApiError.js'

function textoEndereco(endereco) {
  return [
    endereco.rua && endereco.numero ? `${endereco.rua}, ${endereco.numero}` : endereco.rua,
    endereco.bairro,
    endereco.cidade,
    endereco.estado,
    endereco.cep,
    'Brasil',
  ].filter(Boolean).join(', ')
}

export async function geocodificarEndereco(endereco) {
  const q = textoEndereco(endereco)
  if (!q) throw new ApiError(400, 'Informe um endereço completo para calcular a localização.')

  const url = new URL(process.env.GEOCODING_URL || 'https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', q)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('countrycodes', 'br')
  url.searchParams.set('addressdetails', '1')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': process.env.GEOCODING_USER_AGENT || 'EstacaoDelivery/1.0',
      },
      signal: controller.signal,
    })

    if (!response.ok) throw new Error(`Geocoding HTTP ${response.status}`)
    const resultados = await response.json()
    const primeiro = Array.isArray(resultados) ? resultados[0] : null
    const latitude = Number(primeiro?.lat)
    const longitude = Number(primeiro?.lon)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error('Endereço não localizado')
    }

    return { latitude, longitude, consulta: q }
  } catch (error) {
    const detalhe = error?.name === 'AbortError' ? 'O serviço de localização demorou para responder.' : 'Não foi possível localizar o endereço automaticamente.'
    throw new ApiError(422, `${detalhe} Confira rua, número, bairro, cidade, estado e CEP.`)
  } finally {
    clearTimeout(timeout)
  }
}

export function distanciaHaversineKm(lat1, lon1, lat2, lon2) {
  const valores = [lat1, lon1, lat2, lon2].map(Number)
  if (valores.some((v) => !Number.isFinite(v))) return null

  const [aLat, aLon, bLat, bLon] = valores
  const toRad = (graus) => graus * Math.PI / 180
  const dLat = toRad(bLat - aLat)
  const dLon = toRad(bLon - aLon)
  const x = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2
  const distancia = 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))

  return Math.round(distancia * 100) / 100
}


export async function calcularDistanciaRotaKm(origem, destino) {
  const valores = [origem?.latitude, origem?.longitude, destino?.latitude, destino?.longitude].map(Number)
  if (valores.some((v) => !Number.isFinite(v))) {
    throw new ApiError(422, 'Não há coordenadas válidas para calcular a rota de entrega.')
  }

  const [origemLat, origemLon, destinoLat, destinoLon] = valores
  const base = (process.env.ROUTING_URL || 'https://router.project-osrm.org').replace(/\/$/, '')
  const url = `${base}/route/v1/driving/${origemLon},${origemLat};${destinoLon},${destinoLat}`
  const params = new URLSearchParams({ overview: 'false', alternatives: 'false', steps: 'false' })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(`${url}?${params}`, {
      headers: { Accept: 'application/json', 'User-Agent': process.env.ROUTING_USER_AGENT || 'EstacaoDelivery/1.0' },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Routing HTTP ${response.status}`)
    const data = await response.json()
    const metros = Number(data?.routes?.[0]?.distance)
    if (!Number.isFinite(metros)) throw new Error('Rota não encontrada')
    return Math.round((metros / 1000) * 100) / 100
  } catch (error) {
    if (process.env.ROUTING_FALLBACK_HAVERSINE !== 'false') {
      return distanciaHaversineKm(origemLat, origemLon, destinoLat, destinoLon)
    }
    const detalhe = error?.name === 'AbortError' ? 'O serviço de rotas demorou para responder.' : 'Não foi possível calcular a rota até o endereço informado.'
    throw new ApiError(422, detalhe)
  } finally {
    clearTimeout(timeout)
  }
}
