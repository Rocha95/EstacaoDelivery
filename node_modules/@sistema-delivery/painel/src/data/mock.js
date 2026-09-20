export const STATUS = {
  RECEBIDO: 'recebido',
  PRODUCAO: 'producao',
  ENTREGA: 'entrega',
  FINALIZADO: 'finalizado',
}

export const STATUS_LABEL = {
  [STATUS.RECEBIDO]: 'Recebido',
  [STATUS.EM_PRODUCAO]: 'Em produção',
  [STATUS.SAIU_PARA_ENTREGA]: 'Saiu para entrega',
  [STATUS.FINALIZADO]: 'Finalizado',
}

export const STATUS_PILL_CLASS = {
  [STATUS.RECEBIDO]: 'pill-muted',
  [STATUS.EM_PRODUCAO]: 'pill-mustard',
  [STATUS.SAIU_PARA_ENTREGA]: 'pill-sky',
  [STATUS.FINALIZADO]: 'pill-basil',
}

export const initialOrders = [
  { id: '10482', cliente: 'Marina Alves', tipo: 'delivery', itens: ['1x Combo Smash Duplo', '1x Coca 350ml'], total: 42.9, pagamento: 'Pix', status: STATUS.RECEBIDO, hora: '19:42' },
  { id: '10483', cliente: 'Diego Costa', tipo: 'retirada', itens: ['2x Burrito de Frango'], total: 58.0, pagamento: 'Cartão na entrega', status: STATUS.RECEBIDO, hora: '19:44' },
  { id: '10479', cliente: 'Bia Ferreira', tipo: 'delivery', itens: ['1x Poke Salmão', '1x Suco Detox'], total: 39.5, pagamento: 'Pix', status: STATUS.EM_PRODUCAO, hora: '19:31' },
  { id: '10480', cliente: 'Rafael Nunes', tipo: 'delivery', itens: ['1x Pizza Marguerita G', '1x Refri 2L'], total: 67.9, pagamento: 'Dinheiro na entrega', status: STATUS.EM_PRODUCAO, hora: '19:35' },
  { id: '10476', cliente: 'Carla Souza', tipo: 'delivery', itens: ['1x Combo Kids', '1x Milkshake'], total: 33.0, pagamento: 'Pix', status: STATUS.SAIU_PARA_ENTREGA, hora: '19:18' },
  { id: '10474', cliente: 'João Prado', tipo: 'retirada', itens: ['3x Coxinha', '1x Guaraná lata'], total: 24.5, pagamento: 'Cartão na entrega', status: STATUS.FINALIZADO, hora: '19:02' },
  { id: '10473', cliente: 'Elisa Martins', tipo: 'delivery', itens: ['1x Salada Caesar', '1x Água com gás'], total: 29.9, pagamento: 'Pix', status: STATUS.FINALIZADO, hora: '18:55' },
]

export const initialCategorias = [
  { id: 1, nome: 'Lanches', produtos: 12, ordem: 1 },
  { id: 2, nome: 'Pizzas', produtos: 9, ordem: 2 },
  { id: 3, nome: 'Bowls & Saladas', produtos: 6, ordem: 3 },
  { id: 4, nome: 'Bebidas', produtos: 14, ordem: 4 },
  { id: 5, nome: 'Sobremesas', produtos: 5, ordem: 5 },
]

export const initialAdicionais = [
  { id: 1, nome: 'Bacon extra', preco: 6.0, grupo: 'Adicionais de lanche', ativo: true },
  { id: 2, nome: 'Queijo cheddar extra', preco: 4.5, grupo: 'Adicionais de lanche', ativo: true },
  { id: 3, nome: 'Borda recheada catupiry', preco: 9.0, grupo: 'Adicionais de pizza', ativo: true },
  { id: 4, nome: 'Molho extra', preco: 2.0, grupo: 'Molhos', ativo: true },
  { id: 5, nome: 'Sem cebola', preco: 0, grupo: 'Observações', ativo: true },
  { id: 6, nome: 'Ovo frito', preco: 3.5, grupo: 'Adicionais de lanche', ativo: false },
]

export const initialProdutos = [
  { id: 1, nome: 'Combo Smash Duplo', categoria: 'Lanches', preco: 34.9, ativo: true, disponibilidadeInicio: '11:00', disponibilidadeFim: '23:00', adicionais: ['Bacon extra', 'Queijo cheddar extra', 'Sem cebola'] },
  { id: 2, nome: 'Burrito de Frango', categoria: 'Lanches', preco: 29.0, ativo: true, disponibilidadeInicio: '11:00', disponibilidadeFim: '23:00', adicionais: ['Molho extra'] },
  { id: 3, nome: 'Pizza Marguerita G', categoria: 'Pizzas', preco: 54.9, ativo: true, disponibilidadeInicio: '18:00', disponibilidadeFim: '23:30', adicionais: ['Borda recheada catupiry'] },
  { id: 4, nome: 'Poke Salmão', categoria: 'Bowls & Saladas', preco: 39.5, ativo: true, disponibilidadeInicio: '11:00', disponibilidadeFim: '16:00', adicionais: [] },
  { id: 5, nome: 'Milkshake Chocolate', categoria: 'Sobremesas', preco: 18.0, ativo: false, disponibilidadeInicio: '11:00', disponibilidadeFim: '23:00', adicionais: [] },
  { id: 6, nome: 'Coca 350ml', categoria: 'Bebidas', preco: 6.5, ativo: true, disponibilidadeInicio: '00:00', disponibilidadeFim: '23:59', adicionais: [] },
]

export const initialCombos = [
  { id: 1, nome: 'Combo Smash Duplo', itens: ['Smash Duplo', 'Batata média', 'Refrigerante lata'], preco: 42.9, economiza: 8.0, ativo: true },
  { id: 2, nome: 'Combo Kids', itens: ['Mini burger', 'Suco de caixinha', 'Brinde surpresa'], preco: 26.9, economiza: 4.0, ativo: true },
  { id: 3, nome: 'Combo Pizza + Refri 2L', itens: ['Pizza Marguerita G', 'Refrigerante 2L'], preco: 64.9, economiza: 7.9, ativo: true },
]

export const initialHorarios = [
  { dia: 'Segunda', ativo: true, abre: '11:00', fecha: '23:00' },
  { dia: 'Terça', ativo: true, abre: '11:00', fecha: '23:00' },
  { dia: 'Quarta', ativo: true, abre: '11:00', fecha: '23:00' },
  { dia: 'Quinta', ativo: true, abre: '11:00', fecha: '23:00' },
  { dia: 'Sexta', ativo: true, abre: '11:00', fecha: '23:59' },
  { dia: 'Sábado', ativo: true, abre: '11:00', fecha: '23:59' },
  { dia: 'Domingo', ativo: false, abre: '17:00', fecha: '22:00' },
]

export const initialCupons = [
  { id: 1, codigo: 'BEMVINDO10', tipo: 'percentual', valor: 10, minimo: 30, validade: '2026-12-31', usos: 214, ativo: true },
  { id: 2, codigo: 'FRETEGRATIS', tipo: 'frete', valor: 0, minimo: 50, validade: '2026-10-31', usos: 87, ativo: true },
  { id: 3, codigo: 'BLACKFRIDAY', tipo: 'valor_fixo', valor: 15, minimo: 60, validade: '2025-11-30', usos: 340, ativo: false },
]

export const initialTaxas = [
  { id: 1, faixa: 'Até 2 km', valor: 5.0 },
  { id: 2, faixa: '2 km – 4 km', valor: 8.0 },
  { id: 3, faixa: '4 km – 6 km', valor: 12.0 },
  { id: 4, faixa: '6 km – 9 km', valor: 17.0 },
  { id: 5, faixa: 'Acima de 9 km', valor: 22.0 },
]

export const initialClientes = [
  { id: 1, nome: 'Marina Alves', telefone: '(15) 99801-2231', pedidos: 18, ultimoPedido: '2026-09-14', gasto: 812.4 },
  { id: 2, nome: 'Diego Costa', telefone: '(15) 99122-8890', pedidos: 4, ultimoPedido: '2026-09-14', gasto: 231.0 },
  { id: 3, nome: 'Bia Ferreira', telefone: '(15) 98877-4410', pedidos: 27, ultimoPedido: '2026-09-13', gasto: 1204.9 },
  { id: 4, nome: 'Rafael Nunes', telefone: '(15) 99654-0021', pedidos: 9, ultimoPedido: '2026-09-12', gasto: 540.2 },
  { id: 5, nome: 'Carla Souza', telefone: '(15) 99911-3345', pedidos: 2, ultimoPedido: '2026-09-10', gasto: 66.0 },
]

export const initialUsuarios = [
  { id: 1, nome: 'Fernando (dono)', papel: 'Administrador', email: 'fernando@estabelecimento.com', ativo: true },
  { id: 2, nome: 'Patrícia Lima', papel: 'Gerente', email: 'patricia@estabelecimento.com', ativo: true },
  { id: 3, nome: 'Kauê Silva', papel: 'Cozinha', email: 'kaue@estabelecimento.com', ativo: true },
  { id: 4, nome: 'Yasmin Rocha', papel: 'Atendimento', email: 'yasmin@estabelecimento.com', ativo: false },
]
