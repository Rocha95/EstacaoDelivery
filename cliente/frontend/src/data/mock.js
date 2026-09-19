export const categorias = ['Lanches', 'Pizzas', 'Bowls & Saladas', 'Bebidas', 'Sobremesas']

export const produtos = [
  {
    id: 1, nome: 'Combo Smash Duplo', categoria: 'Lanches', preco: 34.9, emoji: '🍔', ativo: true,
    descricao: 'Dois smash burgers, queijo cheddar, molho da casa e pão brioche.',
    adicionais: [
      { grupo: 'Adicionais', max: 3, opcoes: [
        { nome: 'Bacon extra', preco: 6.0 },
        { nome: 'Queijo cheddar extra', preco: 4.5 },
        { nome: 'Ovo frito', preco: 3.5 },
      ]},
      { grupo: 'Observações', max: 2, opcoes: [
        { nome: 'Sem cebola', preco: 0 },
        { nome: 'Sem picles', preco: 0 },
      ]},
    ],
  },
  {
    id: 2, nome: 'Burrito de Frango', categoria: 'Lanches', preco: 29.0, emoji: '🌯', ativo: true,
    descricao: 'Frango grelhado, arroz, feijão preto, pico de gallo e guacamole.',
    adicionais: [
      { grupo: 'Adicionais', max: 2, opcoes: [{ nome: 'Molho extra', preco: 2.0 }, { nome: 'Guacamole extra', preco: 5.0 }] },
    ],
  },
  {
    id: 3, nome: 'Pizza Marguerita G', categoria: 'Pizzas', preco: 54.9, emoji: '🍕', ativo: true,
    descricao: 'Molho de tomate, mussarela de búfala, manjericão fresco.',
    adicionais: [
      { grupo: 'Borda', max: 1, opcoes: [{ nome: 'Borda recheada catupiry', preco: 9.0 }] },
    ],
  },
  {
    id: 4, nome: 'Pizza Calabresa G', categoria: 'Pizzas', preco: 49.9, emoji: '🍕', ativo: true, descricao: 'Calabresa fatiada, cebola roxa e orégano.', adicionais: [],
  },
  {
    id: 5, nome: 'Poke Salmão', categoria: 'Bowls & Saladas', preco: 39.5, emoji: '🥗', ativo: true,
    descricao: 'Salmão fresco, arroz, edamame, manga e molho shoyu.', adicionais: [],
  },
  {
    id: 6, nome: 'Salada Caesar', categoria: 'Bowls & Saladas', preco: 29.9, emoji: '🥬', ativo: true, descricao: 'Alface romana, frango grelhado, croutons e parmesão.', adicionais: [],
  },
  {
    id: 7, nome: 'Coca-Cola 350ml', categoria: 'Bebidas', preco: 6.5, emoji: '🥤', ativo: true, descricao: 'Lata gelada.', adicionais: [],
  },
  {
    id: 8, nome: 'Suco Detox 500ml', categoria: 'Bebidas', preco: 12.0, emoji: '🧃', ativo: true, descricao: 'Couve, maçã, limão e gengibre.', adicionais: [],
  },
  {
    id: 9, nome: 'Milkshake Chocolate', categoria: 'Sobremesas', preco: 18.0, emoji: '🥤', ativo: false, descricao: 'Sorvete de chocolate belga batido na hora.', adicionais: [],
  },
  {
    id: 10, nome: 'Petit Gateau', categoria: 'Sobremesas', preco: 21.0, emoji: '🍫', ativo: true, descricao: 'Bolo quente de chocolate com sorvete de creme.', adicionais: [],
  },
]

export const cuponsValidos = {
  BEMVINDO10: { tipo: 'percentual', valor: 10, minimo: 30 },
  FRETEGRATIS: { tipo: 'frete', valor: 0, minimo: 50 },
}

export const faixasEntrega = [
  { ateKm: 2, valor: 5.0 },
  { ateKm: 4, valor: 8.0 },
  { ateKm: 6, valor: 12.0 },
  { ateKm: 9, valor: 17.0 },
  { ateKm: Infinity, valor: 22.0 },
]

export function calcularTaxaEntrega(distanciaKm) {
  const faixa = faixasEntrega.find((f) => distanciaKm <= f.ateKm)
  return faixa ? faixa.valor : faixasEntrega[faixasEntrega.length - 1].valor
}

export const enderecosSalvos = [
  { id: 1, apelido: 'Casa', rua: 'Rua das Palmeiras, 120', bairro: 'Jardim Europa', distanciaKm: 3.2 },
  { id: 2, apelido: 'Trabalho', rua: 'Av. Central, 890 – sala 12', bairro: 'Centro', distanciaKm: 6.8 },
]

export const historicoPedidos = [
  { id: '10473', data: '2026-09-13', itens: ['1x Salada Caesar', '1x Água com gás'], total: 29.9, status: 'finalizado' },
  { id: '10440', data: '2026-09-08', itens: ['1x Pizza Calabresa G', '1x Coca 2L'], total: 61.9, status: 'finalizado' },
  { id: '10391', data: '2026-08-29', itens: ['2x Combo Smash Duplo'], total: 69.8, status: 'finalizado' },
]
