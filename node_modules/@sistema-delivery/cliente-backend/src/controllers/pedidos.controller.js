import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { obterDistanciaDoEndereco } from './taxasEntrega.controller.js'

const INCLUDE_PADRAO = {
  cliente: { select: { id: true, nome: true, telefone: true } },
  endereco: true,
  cupom: true,
  itens: { include: { produto: true, combo: true, adicionais: true } },
}

const STATUS_ATIVOS = ['RECEBIDO', 'EM_PRODUCAO', 'SAIU_PARA_ENTREGA']

function numero(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function arredondar(v) {
  return Math.round((v + Number.EPSILON) * 100) / 100
}

function horaAtualEmMinutos() {
  const agora = new Date()
  return agora.getHours() * 60 + agora.getMinutes()
}

function dentroDaJanela(inicio, fim) {
  if (!inicio || !fim) return true
  const [hi, mi] = inicio.split(':').map(Number)
  const [hf, mf] = fim.split(':').map(Number)
  const atual = horaAtualEmMinutos()
  const a = hi * 60 + mi
  const b = hf * 60 + mf
  return a <= b ? atual >= a && atual <= b : atual >= a || atual <= b
}

async function calcularTaxa(distanciaKm) {
  const faixas = await prisma.faixaTaxaEntrega.findMany({ orderBy: { ateKm: 'asc' } })
  const config = await prisma.configuracao.findUnique({ where: { id: 'default' } })
  if (config && distanciaKm > config.raioMaximoEntregaKm) return null
  const faixa = faixas.find((f) => distanciaKm <= Number(f.ateKm)) ?? faixas.at(-1)
  return faixa ? numero(faixa.valor) : 0
}

async function validarItens(itens) {
  const produtosIds = [...new Set(itens.filter(i => i.produtoId).map(i => i.produtoId))]
  const combosIds = [...new Set(itens.filter(i => i.comboId).map(i => i.comboId))]

  const [produtos, combos] = await Promise.all([
    produtosIds.length ? prisma.produto.findMany({
      where: { id: { in: produtosIds }, ativo: true, categoria: { ativa: true } },
      include: { categoria: { include: { adicionais: { where: { ativo: true }, orderBy: { nome: 'asc' } } } } },
    }) : [],
    combosIds.length ? prisma.combo.findMany({
      where: { id: { in: combosIds }, ativo: true },
      include: { itens: { include: { produto: true } } },
    }) : [],
  ])

  const produtosMap = new Map(produtos.map(p => [p.id, p]))
  const combosMap = new Map(combos.map(c => [c.id, c]))

  if (produtosMap.size !== produtosIds.length) throw new ApiError(400, 'Um ou mais produtos não estão mais disponíveis.')
  if (combosMap.size !== combosIds.length) throw new ApiError(400, 'Um ou mais combos não estão mais disponíveis.')

  const snapshots = []
  let subtotal = 0

  for (const item of itens) {
    const quantidade = Math.floor(Number(item.quantidade))
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 99) {
      throw new ApiError(400, 'Quantidade de item inválida.')
    }

    if ((item.produtoId ? 1 : 0) + (item.comboId ? 1 : 0) !== 1) {
      throw new ApiError(400, 'Cada item deve referenciar um produto ou um combo.')
    }

    const entidade = item.produtoId ? produtosMap.get(item.produtoId) : combosMap.get(item.comboId)
    if (!entidade) throw new ApiError(400, 'Item inválido.')

    if (item.produtoId && !dentroDaJanela(entidade.disponibilidadeInicio, entidade.disponibilidadeFim)) {
      throw new ApiError(400, `O produto "${entidade.nome}" não está disponível neste horário.`)
    }

    const precoBase = numero(entidade.preco)
    const grupos = item.produtoId && entidade.categoria ? [{ id: entidade.categoria.id, nome: entidade.categoria.nome, maximoSelecao: (entidade.categoria.adicionais || []).length, obrigatorio: false, opcoes: entidade.categoria.adicionais || [] }] : []
    const selecionados = Array.isArray(item.adicionais) ? item.adicionais : []

    const opcionaisPorId = new Map()
    for (const grupo of grupos) for (const opcao of grupo.opcoes) opcionaisPorId.set(opcao.id, { ...opcao, grupoId: grupo.id, categoriaId: grupo.id })

    const idsSelecionados = new Set()
    const porGrupo = new Map()
    const adicionaisSnapshot = []

    for (const adicional of selecionados) {
      if (!adicional.opcaoId || idsSelecionados.has(adicional.opcaoId)) {
        throw new ApiError(400, 'Adicionais inválidos ou duplicados.')
      }
      idsSelecionados.add(adicional.opcaoId)
      const opcao = opcionaisPorId.get(adicional.opcaoId)
      if (!opcao) throw new ApiError(400, 'Um dos adicionais selecionados não está disponível para este produto.')

      porGrupo.set(opcao.grupoId, (porGrupo.get(opcao.grupoId) || 0) + 1)
      adicionaisSnapshot.push({ opcaoId: opcao.id, nome: opcao.nome, preco: numero(opcao.preco) })
    }

    for (const grupo of grupos) {
      const qtd = porGrupo.get(grupo.id) || 0
      if (grupo.obrigatorio && qtd === 0) throw new ApiError(400, `Selecione uma opção em "${grupo.nome}".`)
      if (qtd > grupo.maximoSelecao) throw new ApiError(400, `O grupo "${grupo.nome}" permite no máximo ${grupo.maximoSelecao} opção(ões).`)
    }

    const precoUnitario = arredondar(precoBase + adicionaisSnapshot.reduce((s, a) => s + a.preco, 0))
    subtotal += precoUnitario * quantidade

    snapshots.push({
      produtoId: item.produtoId ?? null,
      comboId: item.comboId ?? null,
      nome: entidade.nome,
      precoUnitario,
      quantidade,
      adicionais: adicionaisSnapshot,
    })
  }

  return { snapshots, subtotal: arredondar(subtotal) }
}

async function calcularDesconto(cupom, subtotal) {
  if (!cupom) return 0
  if (!cupom.ativo || (cupom.validoAte && new Date() > cupom.validoAte)) {
    throw new ApiError(400, 'Cupom inválido ou expirado.')
  }
  if (subtotal < numero(cupom.pedidoMinimo)) {
    throw new ApiError(400, `Pedido mínimo de R$ ${numero(cupom.pedidoMinimo).toFixed(2)} para esse cupom.`)
  }

  if (cupom.tipo === 'PERCENTUAL') return arredondar(Math.min(subtotal, subtotal * numero(cupom.valor) / 100))
  if (cupom.tipo === 'VALOR_FIXO') return arredondar(Math.min(subtotal, numero(cupom.valor)))
  return 0
}

export async function criar(req, res) {
  const { tipoEntrega, enderecoId, formaPagamento, itens, cupomId, observacoes, agendadoPara } = req.body

  if (!['DELIVERY', 'RETIRADA'].includes(tipoEntrega)) throw new ApiError(400, 'Tipo de entrega inválido.')
  if (!['PIX', 'DINHEIRO_ENTREGA', 'CARTAO_ENTREGA'].includes(formaPagamento)) throw new ApiError(400, 'Forma de pagamento inválida.')
  if (!Array.isArray(itens) || itens.length === 0) throw new ApiError(400, 'Adicione ao menos um item ao pedido.')
  if (itens.length > 50) throw new ApiError(400, 'O pedido possui itens demais.')

  let dataAgendamento = null
  if (agendadoPara) {
    dataAgendamento = new Date(agendadoPara)
    if (Number.isNaN(dataAgendamento.getTime())) throw new ApiError(400, 'Data de agendamento inválida.')
    const agora = Date.now()
    const minimo = agora + 30 * 60 * 1000
    const maximo = agora + 7 * 24 * 60 * 60 * 1000
    if (dataAgendamento.getTime() < minimo) throw new ApiError(400, 'O agendamento deve ser feito com pelo menos 30 minutos de antecedência.')
    if (dataAgendamento.getTime() > maximo) throw new ApiError(400, 'O agendamento pode ser feito para no máximo 7 dias.')
  }

  const config = await prisma.configuracao.findUnique({ where: { id: 'default' } })
  if (!config) throw new ApiError(400, 'Configuração do estabelecimento não encontrada.')
  if (tipoEntrega === 'DELIVERY' && !config.aceitaDelivery) throw new ApiError(400, 'Delivery indisponível no momento.')
  if (tipoEntrega === 'RETIRADA' && !config.aceitaRetirada) throw new ApiError(400, 'Retirada indisponível no momento.')

  const { snapshots, subtotal } = await validarItens(itens)

  if (subtotal < numero(config.pedidoMinimo)) {
    throw new ApiError(400, `O pedido mínimo é de R$ ${numero(config.pedidoMinimo).toFixed(2)}.`)
  }

  let endereco = null
  let taxaEntrega = 0

  if (tipoEntrega === 'DELIVERY') {
    endereco = await prisma.endereco.findFirst({
      where: { id: enderecoId, usuarioId: req.usuario.id },
    })
    if (!endereco) throw new ApiError(400, 'Endereço de entrega inválido.')

    const distancia = await obterDistanciaDoEndereco(endereco, config)
    const taxa = await calcularTaxa(distancia)
    if (taxa === null) throw new ApiError(400, 'O endereço está fora do raio de entrega.')
    taxaEntrega = taxa
  }

  let cupom = null
  let desconto = 0
  if (cupomId) {
    cupom = await prisma.cupom.findUnique({ where: { id: cupomId } })
    if (!cupom) throw new ApiError(400, 'Cupom não encontrado.')
    desconto = await calcularDesconto(cupom, subtotal)
  }

  if (cupom?.tipo === 'FRETE_GRATIS') taxaEntrega = 0

  const total = arredondar(Math.max(0, subtotal + taxaEntrega - desconto))

  const pedido = await prisma.pedido.create({
    data: {
      clienteId: req.usuario.id,
      tipoEntrega,
      enderecoId: tipoEntrega === 'DELIVERY' ? endereco.id : null,
      formaPagamento,
      cupomId: cupom?.id ?? null,
      subtotal,
      taxaEntrega,
      desconto,
      total,
      observacoes: observacoes?.trim() || null,
      agendadoPara: dataAgendamento,
      itens: {
        create: snapshots.map(item => ({
          produtoId: item.produtoId,
          comboId: item.comboId,
          nome: item.nome,
          precoUnitario: item.precoUnitario,
          quantidade: item.quantidade,
          adicionais: item.adicionais.length ? { create: item.adicionais } : undefined,
        })),
      },
    },
    include: INCLUDE_PADRAO,
  })

  res.status(201).json(pedido)
}

export async function meusPedidos(req, res) {
  const pedidos = await prisma.pedido.findMany({
    where: { clienteId: req.usuario.id },
    include: INCLUDE_PADRAO,
    orderBy: { criadoEm: 'desc' },
  })
  res.json(pedidos)
}

export async function obter(req, res) {
  const pedido = await prisma.pedido.findFirst({
    where: { id: req.params.id, clienteId: req.usuario.id },
    include: INCLUDE_PADRAO,
  })
  if (!pedido) throw new ApiError(404, 'Pedido não encontrado.')
  res.json(pedido)
}
