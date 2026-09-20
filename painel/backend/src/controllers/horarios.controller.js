import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

export async function listar(req, res) {
  const horarios = await prisma.horarioFuncionamento.findMany({ orderBy: { diaSemana: 'asc' } })
  res.json(horarios)
}

export async function atualizarDia(req, res) {
  const diaSemana = Number(req.params.diaSemana)
  if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) throw new ApiError(400, 'diaSemana deve ser um número de 0 (domingo) a 6 (sábado).')
  const { ativo, abre, fecha } = req.body
  if (abre !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(abre)) throw new ApiError(400, 'Horário de abertura inválido.')
  if (fecha !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(fecha)) throw new ApiError(400, 'Horário de fechamento inválido.')
  if (ativo && abre && fecha && abre >= fecha) throw new ApiError(400, 'O horário de abertura deve ser anterior ao fechamento.')
  const horario = await prisma.horarioFuncionamento.upsert({ where: { diaSemana }, update: { ativo: Boolean(ativo), abre, fecha }, create: { diaSemana, ativo: ativo ?? true, abre: abre ?? '11:00', fecha: fecha ?? '23:00' } })
  res.json(horario)
}
