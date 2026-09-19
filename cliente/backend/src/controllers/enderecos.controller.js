import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

export async function listar(req, res) {
  const { usuarioId } = req.query
  if (!usuarioId) throw new ApiError(400, 'Informe usuarioId.')

  const enderecos = await prisma.endereco.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: 'desc' },
  })
  res.json(enderecos)
}

export async function criar(req, res) {
  const { usuarioId, apelido, rua, numero, complemento, bairro, cidade, estado, cep, distanciaKm } = req.body
  if (!usuarioId || !rua || !bairro) throw new ApiError(400, 'Informe usuarioId, rua e bairro.')

  const endereco = await prisma.endereco.create({
    data: { usuarioId, apelido, rua, numero, complemento, bairro, cidade: cidade ?? '', estado: estado ?? '', cep, distanciaKm },
  })
  res.status(201).json(endereco)
}

export async function remover(req, res) {
  await prisma.endereco.delete({ where: { id: req.params.id } })
  res.status(204).send()
}
