import { prisma } from '../lib/prisma.js'

const DADOS_PADRAO = {
  id: 'default',
  nomeEstabelecimento: 'Meu Estabelecimento',
  endereco: '',
}

export async function obter(req, res) {
  const config = await prisma.configuracao.upsert({
    where: { id: 'default' },
    update: {},
    create: DADOS_PADRAO,
  })
  res.json(config)
}

export async function atualizar(req, res) {
  const {
    nomeEstabelecimento, telefone, endereco, latitude, longitude,
    pedidoMinimo, tempoPreparoMedioMin, raioMaximoEntregaKm,
    aceitaDelivery, aceitaRetirada,
  } = req.body

  const config = await prisma.configuracao.upsert({
    where: { id: 'default' },
    update: {
      nomeEstabelecimento, telefone, endereco, latitude, longitude,
      pedidoMinimo, tempoPreparoMedioMin, raioMaximoEntregaKm,
      aceitaDelivery, aceitaRetirada,
    },
    create: { ...DADOS_PADRAO, nomeEstabelecimento: nomeEstabelecimento ?? DADOS_PADRAO.nomeEstabelecimento, endereco: endereco ?? '' },
  })
  res.json(config)
}
