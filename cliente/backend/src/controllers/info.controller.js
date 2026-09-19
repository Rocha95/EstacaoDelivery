import { prisma } from '../lib/prisma.js'

// Dados públicos de exibição (cabeçalho do cardápio, "loja aberta", etc).
// Sem autenticação — não expõe nada sensível do estabelecimento.
export async function obterConfiguracao(req, res) {
  const config = await prisma.configuracao.findUnique({ where: { id: 'default' } })
  res.json(config ?? null)
}

export async function listarHorarios(req, res) {
  const horarios = await prisma.horarioFuncionamento.findMany({ orderBy: { diaSemana: 'asc' } })
  res.json(horarios)
}
