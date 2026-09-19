import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

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
