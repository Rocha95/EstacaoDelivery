import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

export async function listar(req, res) {
  const horarios = await prisma.horarioFuncionamento.findMany({ orderBy: { diaSemana: 'asc' } })
  res.json(horarios)
}

// upsert por diaSemana (0=domingo...6=sábado) — simplifica o front, que
// só precisa mandar { ativo, abre, fecha } pra cada dia da semana.
export async function atualizarDia(req, res) {
  const diaSemana = Number(req.params.diaSemana)
  if (Number.isNaN(diaSemana) || diaSemana < 0 || diaSemana > 6) {
    throw new ApiError(400, 'diaSemana deve ser um número de 0 (domingo) a 6 (sábado).')
  }
  const { ativo, abre, fecha } = req.body

  const horario = await prisma.horarioFuncionamento.upsert({
    where: { diaSemana },
    update: { ativo, abre, fecha },
    create: { diaSemana, ativo: ativo ?? true, abre: abre ?? '11:00', fecha: fecha ?? '23:00' },
  })
  res.json(horario)
}
