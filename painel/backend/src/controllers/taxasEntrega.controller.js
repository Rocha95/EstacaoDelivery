import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { geocodificarEstabelecimento } from './configuracoes.controller.js'

export async function listarFaixas(req, res) {
  const faixas = await prisma.faixaTaxaEntrega.findMany({ orderBy: { ordem: 'asc' } })
  res.json(faixas)
}

export async function criarFaixa(req, res) {
  const { ateKm, valor, ordem } = req.body
  if (ateKm === undefined || valor === undefined) throw new ApiError(400, 'Informe ateKm e valor da faixa.')

  const ultima = await prisma.faixaTaxaEntrega.count()
  const faixa = await prisma.faixaTaxaEntrega.create({ data: { ateKm, valor, ordem: ordem ?? ultima + 1 } })
  res.status(201).json(faixa)
}

export async function atualizarFaixa(req, res) {
  const { id } = req.params
  const { ateKm, valor, ordem } = req.body
  const faixa = await prisma.faixaTaxaEntrega.update({ where: { id }, data: { ateKm, valor, ordem } })
  res.json(faixa)
}

export async function removerFaixa(req, res) {
  await prisma.faixaTaxaEntrega.delete({ where: { id: req.params.id } })
  res.status(204).send()
}


const CONFIG_ID = 'default'

export async function obterConfiguracaoEntrega(req, res) {
  const [config, faixas] = await Promise.all([
    prisma.configuracao.upsert({
      where: { id: CONFIG_ID },
      update: {},
      create: { id: CONFIG_ID, nomeEstabelecimento: 'Meu Estabelecimento', endereco: '' },
    }),
    prisma.faixaTaxaEntrega.findMany({ orderBy: { ordem: 'asc' } }),
  ])

  res.json({
    endereco: config.endereco,
    raioMax: config.raioMaximoEntregaKm,
    taxas: faixas,
  })
}

export async function salvarConfiguracaoEntrega(req, res) {
  const { endereco, raioMax, taxas } = req.body || {}
  let coordenadas = null
  if (endereco !== undefined && String(endereco).trim()) {
    coordenadas = await geocodificarEstabelecimento(String(endereco).trim())
  }

  const config = await prisma.configuracao.upsert({
    where: { id: CONFIG_ID },
    update: {
      ...(endereco !== undefined && { endereco: String(endereco).trim() }),
      ...(coordenadas && { latitude: coordenadas.latitude, longitude: coordenadas.longitude }),
      ...(raioMax !== undefined && { raioMaximoEntregaKm: Number(raioMax) }),
    },
    create: {
      id: CONFIG_ID,
      nomeEstabelecimento: 'Meu Estabelecimento',
      endereco: String(endereco || '').trim(),
      ...(coordenadas && { latitude: coordenadas.latitude, longitude: coordenadas.longitude }),
      raioMaximoEntregaKm: Number(raioMax) || 12,
    },
  })

  if (Array.isArray(taxas)) {
    for (const taxa of taxas) {
      const valor = Number(taxa.valor)
      if (!Number.isFinite(valor) || valor < 0) continue
      if (typeof taxa.id === 'string' && !taxa.id.startsWith('padrao-')) {
        await prisma.faixaTaxaEntrega.update({
          where: { id: taxa.id },
          data: { valor },
        })
      } else {
        await prisma.faixaTaxaEntrega.create({
          data: { ateKm: Number(taxa.ateKm) || 0, valor, ordem: Number(taxa.ordem) || 1 },
        })
      }
    }
  }

  const faixas = await prisma.faixaTaxaEntrega.findMany({ orderBy: { ordem: 'asc' } })
  res.json({ endereco: config.endereco, raioMax: config.raioMaximoEntregaKm, taxas: faixas })
}
