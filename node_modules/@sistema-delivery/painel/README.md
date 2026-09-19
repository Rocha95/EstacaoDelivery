# Painel do Estabelecimento — Sistema de Pedidos e Delivery

Área administrativa (dono/equipe) do sistema de pedidos e delivery. React + Vite,
com dados mock em memória (sem backend ainda) para validar fluxo e telas antes
de conectar com a API real (Node.js + Prisma + PostgreSQL).

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:5173

## Estrutura

```
src/
  components/   Sidebar, Topbar, StatusPill (reutilizáveis)
  data/mock.js  Dados de exemplo (substituir por chamadas à API depois)
  pages/        Uma página por rota do menu lateral
  App.jsx       Definição das rotas
  index.css     Sistema de design (tokens de cor, tipografia, componentes)
```

## Telas incluídas

- **Dashboard** — visão geral do turno com "linha de expedição": pedidos
  organizados por estação (Recebido → Em produção → Saiu para entrega →
  Finalizado), com botão para avançar o status.
- **Pedidos** — lista completa com busca e filtro por status.
- **Produtos** — cadastro com preço, categoria, janela de disponibilidade
  (horário) e toggle ativo/inativo para tirar do cardápio do cliente sem
  apagar o produto.
- **Categorias** — organização das seções do cardápio.
- **Adicionais** — itens extras agrupados (ex: "Adicionais de lanche"),
  com toggle ativo/inativo.
- **Combos** — agrupamentos de produtos com preço promocional.
- **Horários** — funcionamento por dia da semana (aceita pedidos, abre, fecha).
- **Cupons** — percentual, valor fixo ou frete grátis, com pedido mínimo e validade.
- **Taxas de entrega** — faixas de distância a partir do endereço do
  estabelecimento (usadas no cálculo de frete do lado do cliente).
- **Clientes** — histórico de quem já comprou.
- **Usuários** — quem acessa o painel e com qual função.
- **Configurações** — dados gerais do estabelecimento.
- **Relatórios** — faturamento por dia e produtos mais vendidos.

## Próximos passos sugeridos

1. Substituir `src/data/mock.js` por chamadas à API (Node.js + Express + Prisma).
2. Autenticação de usuários do painel (login + permissões por papel).
3. WebSocket ou polling para atualizar o Dashboard/Pedidos em tempo real
   conforme novos pedidos chegam do lado do cliente.
4. Conectar "Taxas de entrega" a um serviço de geocoding/distância real
   (ex: Google Distance Matrix) em vez de faixas fixas.
