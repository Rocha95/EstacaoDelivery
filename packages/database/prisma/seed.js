// Carrega o banco com os mesmos dados de exemplo usados nas telas de
// painel/frontend e cliente/frontend, para já nascer com algo pra ver rodando.
//
// Rodar: npm run prisma:migrate   (cria as tabelas)
//        npm run seed

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Placeholder — troque por um hash de verdade (ex: bcrypt) quando a
// autenticação real for implementada.
const SENHA_PLACEHOLDER = 'trocar-por-hash-bcrypt'

async function main() {
  console.log('Zerando dados antigos...')
  await prisma.avaliacao.deleteMany()
  await prisma.movimentoFidelidade.deleteMany()
  await prisma.fidelidade.deleteMany()
  await prisma.estoqueMovimento.deleteMany()
  await prisma.pagamento.deleteMany()
  await prisma.itemPedidoAdicional.deleteMany()
  await prisma.itemPedido.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.comboItem.deleteMany()
  await prisma.combo.deleteMany()
  await prisma.produtoGrupoAdicional.deleteMany()
  await prisma.opcaoAdicional.deleteMany()
  await prisma.grupoAdicional.deleteMany()
  await prisma.produto.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.endereco.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.cupom.deleteMany()
  await prisma.faixaTaxaEntrega.deleteMany()
  await prisma.horarioFuncionamento.deleteMany()
  await prisma.configuracao.deleteMany()
  await prisma.estabelecimento.deleteMany()

  await prisma.estabelecimento.create({ data: { id: 'default', slug: 'default', nome: 'Estação Delivery' } })

  console.log('Configuração geral...')
  await prisma.configuracao.create({
    data: {
      id: 'default',
      estabelecimentoId: 'default',
      nomeEstabelecimento: 'Estação Delivery',
      telefone: '(15) 99000-1122',
      endereco: 'Av. Presidente Vargas, 450 – Votorantim/SP',
      enderecoRua: 'Av. Presidente Vargas',
      enderecoNumero: '450',
      enderecoBairro: 'Centro',
      enderecoCidade: 'Votorantim',
      enderecoEstado: 'SP',
      enderecoCep: null,
      pedidoMinimo: 25.0,
      tempoPreparoMedioMin: 35,
      raioMaximoEntregaKm: 12,
      aceitaDelivery: true,
      aceitaRetirada: true,
    },
  })

  console.log('Horários de funcionamento...')
  const dias = [
    { diaSemana: 1, ativo: true, abre: '11:00', fecha: '23:00' }, // Segunda
    { diaSemana: 2, ativo: true, abre: '11:00', fecha: '23:00' },
    { diaSemana: 3, ativo: true, abre: '11:00', fecha: '23:00' },
    { diaSemana: 4, ativo: true, abre: '11:00', fecha: '23:00' },
    { diaSemana: 5, ativo: true, abre: '11:00', fecha: '23:59' }, // Sexta
    { diaSemana: 6, ativo: true, abre: '11:00', fecha: '23:59' }, // Sábado
    { diaSemana: 0, ativo: false, abre: '17:00', fecha: '22:00' }, // Domingo
  ]
  await prisma.horarioFuncionamento.createMany({ data: dias.map(d => ({ ...d, estabelecimentoId: 'default' })) })

  console.log('Faixas de taxa de entrega...')
  await prisma.faixaTaxaEntrega.createMany({
    data: [
      { estabelecimentoId: 'default', ateKm: 2, valor: 5.0, ordem: 1 },
      { estabelecimentoId: 'default', ateKm: 4, valor: 8.0, ordem: 2 },
      { estabelecimentoId: 'default', ateKm: 6, valor: 12.0, ordem: 3 },
      { estabelecimentoId: 'default', ateKm: 9, valor: 17.0, ordem: 4 },
      { estabelecimentoId: 'default', ateKm: 999, valor: 22.0, ordem: 5 },
    ],
  })

  console.log('Cupons...')
  await prisma.cupom.createMany({
    data: [
      { estabelecimentoId: 'default', codigo: 'BEMVINDO10', tipo: 'PERCENTUAL', valor: 10, pedidoMinimo: 30, validoAte: new Date('2026-12-31'), ativo: true },
      { estabelecimentoId: 'default', codigo: 'FRETEGRATIS', tipo: 'FRETE_GRATIS', valor: 0, pedidoMinimo: 50, validoAte: new Date('2026-10-31'), ativo: true },
      { estabelecimentoId: 'default', codigo: 'BLACKFRIDAY', tipo: 'VALOR_FIXO', valor: 15, pedidoMinimo: 60, validoAte: new Date('2025-11-30'), ativo: false },
    ],
  })

  console.log('Categorias e produtos...')
  const categoriasData = [
    { nome: 'Lanches', ordem: 1 },
    { nome: 'Pizzas', ordem: 2 },
    { nome: 'Bowls & Saladas', ordem: 3 },
    { nome: 'Bebidas', ordem: 4 },
    { nome: 'Sobremesas', ordem: 5 },
  ]
  const categorias = {}
  for (const c of categoriasData) {
    categorias[c.nome] = await prisma.categoria.create({ data: { ...c, estabelecimentoId: 'default' } })
  }

  const grupoLanche = await prisma.grupoAdicional.create({
    data: {
      estabelecimentoId: 'default',
      nome: 'Adicionais de lanche',
      maximoSelecao: 3,
      opcoes: {
        create: [
          { nome: 'Bacon extra', preco: 6.0, estabelecimentoId: 'default' },
          { nome: 'Queijo cheddar extra', preco: 4.5, estabelecimentoId: 'default' },
          { nome: 'Ovo frito', preco: 3.5, estabelecimentoId: 'default' },
        ],
      },
    },
  })
  const grupoObservacoes = await prisma.grupoAdicional.create({
    data: {
      estabelecimentoId: 'default',
      nome: 'Observações',
      maximoSelecao: 2,
      opcoes: { create: [{ nome: 'Sem cebola', preco: 0, estabelecimentoId: 'default' }, { nome: 'Sem picles', preco: 0, estabelecimentoId: 'default' }] },
    },
  })
  const grupoBorda = await prisma.grupoAdicional.create({
    data: {
      estabelecimentoId: 'default',
      nome: 'Borda',
      maximoSelecao: 1,
      opcoes: { create: [{ nome: 'Borda recheada catupiry', preco: 9.0, estabelecimentoId: 'default' }] },
    },
  })

  const produtosData = [
    { nome: 'Combo Smash Duplo', categoria: 'Lanches', preco: 34.9, emoji: '🍔', descricao: 'Dois smash burgers, queijo cheddar, molho da casa e pão brioche.', grupos: [grupoLanche, grupoObservacoes] },
    { nome: 'Burrito de Frango', categoria: 'Lanches', preco: 29.0, emoji: '🌯', descricao: 'Frango grelhado, arroz, feijão preto, pico de gallo e guacamole.', grupos: [] },
    { nome: 'Pizza Marguerita G', categoria: 'Pizzas', preco: 54.9, emoji: '🍕', descricao: 'Molho de tomate, mussarela de búfala, manjericão fresco.', grupos: [grupoBorda], disponibilidadeInicio: '18:00', disponibilidadeFim: '23:30' },
    { nome: 'Pizza Calabresa G', categoria: 'Pizzas', preco: 49.9, emoji: '🍕', descricao: 'Calabresa fatiada, cebola roxa e orégano.', grupos: [] },
    { nome: 'Poke Salmão', categoria: 'Bowls & Saladas', preco: 39.5, emoji: '🥗', descricao: 'Salmão fresco, arroz, edamame, manga e molho shoyu.', grupos: [], disponibilidadeInicio: '11:00', disponibilidadeFim: '16:00' },
    { nome: 'Salada Caesar', categoria: 'Bowls & Saladas', preco: 29.9, emoji: '🥬', descricao: 'Alface romana, frango grelhado, croutons e parmesão.', grupos: [] },
    { nome: 'Coca-Cola 350ml', categoria: 'Bebidas', preco: 6.5, emoji: '🥤', descricao: 'Lata gelada.', grupos: [] },
    { nome: 'Suco Detox 500ml', categoria: 'Bebidas', preco: 12.0, emoji: '🧃', descricao: 'Couve, maçã, limão e gengibre.', grupos: [] },
    { nome: 'Milkshake Chocolate', categoria: 'Sobremesas', preco: 18.0, emoji: '🥤', descricao: 'Sorvete de chocolate belga batido na hora.', grupos: [], ativo: false },
    { nome: 'Petit Gateau', categoria: 'Sobremesas', preco: 21.0, emoji: '🍫', descricao: 'Bolo quente de chocolate com sorvete de creme.', grupos: [] },
  ]

  const produtos = {}
  for (const p of produtosData) {
    produtos[p.nome] = await prisma.produto.create({
      data: {
        estabelecimentoId: 'default',
        nome: p.nome,
        descricao: p.descricao,
        preco: p.preco,
        emoji: p.emoji,
        ativo: p.ativo ?? true,
        disponibilidadeInicio: p.disponibilidadeInicio,
        disponibilidadeFim: p.disponibilidadeFim,
        categoriaId: categorias[p.categoria].id,
        gruposAdicionais: { create: p.grupos.map((g) => ({ grupoId: g.id })) },
      },
    })
  }

  console.log('Combos...')
  await prisma.combo.create({
    data: {
      estabelecimentoId: 'default',
      nome: 'Combo Smash Duplo',
      preco: 42.9,
      itens: { create: [{ produtoId: produtos['Combo Smash Duplo'].id, quantidade: 1 }] },
    },
  })
  await prisma.combo.create({
    data: {
      estabelecimentoId: 'default',
      nome: 'Combo Pizza + Refri',
      preco: 64.9,
      itens: {
        create: [
          { produtoId: produtos['Pizza Marguerita G'].id, quantidade: 1 },
          { produtoId: produtos['Coca-Cola 350ml'].id, quantidade: 1 },
        ],
      },
    },
  })

  console.log('Usuários (equipe + clientes)...')
  await prisma.usuario.createMany({
    data: [
      { estabelecimentoId: 'default', nome: 'Fernando (dono)', email: 'fernando@estabelecimento.com', senhaHash: SENHA_PLACEHOLDER, tipo: 'EQUIPE', papel: 'ADMINISTRADOR' },
      { estabelecimentoId: 'default', nome: 'Patrícia Lima', email: 'patricia@estabelecimento.com', senhaHash: SENHA_PLACEHOLDER, tipo: 'EQUIPE', papel: 'GERENTE' },
      { estabelecimentoId: 'default', nome: 'Kauê Silva', email: 'kaue@estabelecimento.com', senhaHash: SENHA_PLACEHOLDER, tipo: 'EQUIPE', papel: 'COZINHA' },
      { estabelecimentoId: 'default', nome: 'Yasmin Rocha', email: 'yasmin@estabelecimento.com', senhaHash: SENHA_PLACEHOLDER, tipo: 'EQUIPE', papel: 'ATENDIMENTO', ativo: false },
    ],
  })

  const marina = await prisma.usuario.create({
    data: {
      nome: 'Marina Alves',
      telefone: '(15) 99801-2231',
      senhaHash: SENHA_PLACEHOLDER,
      tipo: 'CLIENTE',
      enderecos: {
        create: [
          { apelido: 'Casa', rua: 'Rua das Palmeiras, 120', bairro: 'Jardim Europa', cidade: 'Votorantim', estado: 'SP', distanciaKm: 3.2 },
        ],
      },
    },
  })
  await prisma.usuario.create({
    data: {
      nome: 'Diego Costa',
      telefone: '(15) 99122-8890',
      senhaHash: SENHA_PLACEHOLDER,
      tipo: 'CLIENTE',
      enderecos: {
        create: [
          { apelido: 'Trabalho', rua: 'Av. Central, 890 – sala 12', bairro: 'Centro', cidade: 'Votorantim', estado: 'SP', distanciaKm: 6.8 },
        ],
      },
    },
  })

  console.log('Um pedido de exemplo...')
  const enderecoMarina = await prisma.endereco.findFirstOrThrow({ where: { usuarioId: marina.id } })
  await prisma.pedido.create({
    data: {
      estabelecimentoId: 'default',
      clienteId: marina.id,
      tipoEntrega: 'DELIVERY',
      enderecoId: enderecoMarina.id,
      formaPagamento: 'PIX',
      status: 'RECEBIDO',
      subtotal: 42.9,
      taxaEntrega: 8.0,
      desconto: 0,
      total: 50.9,
      itens: {
        create: [
          {
            produtoId: produtos['Combo Smash Duplo'].id,
            nome: 'Combo Smash Duplo',
            precoUnitario: 34.9,
            quantidade: 1,
          },
          {
            produtoId: produtos['Coca-Cola 350ml'].id,
            nome: 'Coca-Cola 350ml',
            precoUnitario: 6.5,
            quantidade: 1,
          },
        ],
      },
    },
  })

  console.log('Seed concluído.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
