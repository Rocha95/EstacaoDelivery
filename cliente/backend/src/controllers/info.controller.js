import { prisma } from '../lib/prisma.js'

// Dados públicos de exibição (cabeçalho do cardápio, "loja aberta", etc).
// Sem autenticação — não expõe nada sensível do estabelecimento.
export async function obterConfiguracao(req, res) {
  const config = await prisma.configuracao.findUnique({ where: { id: req.estabelecimentoId === 'default' ? 'default' : `config-${req.estabelecimentoId}` } })
  res.json(config ? { ...config, pagamentoOnlinePix: process.env.PAYMENT_PROVIDER === 'mercadopago', pixManualConfigurado: Boolean(config.chavePix) } : null)
}

export async function listarHorarios(req, res) {
  const horarios = await prisma.horarioFuncionamento.findMany({ where: { estabelecimentoId: req.estabelecimentoId }, orderBy: { diaSemana: 'asc' } })
  res.json(horarios)
}
