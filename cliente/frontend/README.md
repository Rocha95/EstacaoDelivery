# App do Cliente — Sistema de Pedidos e Delivery

Área do cliente do sistema de pedidos e delivery. React + Vite, estilo app
mobile (funciona bem em tela cheia no celular e centralizado em telas
largas). Dados mock em memória — substituir por chamadas à API depois.

## Como rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5174 (porta diferente da área do estabelecimento,
que roda em 5173 — dá pra rodar os dois projetos ao mesmo tempo).

## Estrutura

```
src/
  context/      CartContext (carrinho, entrega, cupom, pagamento) e AuthContext (login)
  data/mock.js  Cardápio, cupons, faixas de taxa de entrega, endereços, histórico
  components/   StoreHeader, BottomNav, TopNavBack, BottomCartBar
  pages/        Uma página por tela do fluxo do cliente
```

## Telas incluídas

- **Home (cardápio)** — categorias em abas + grid de produtos. Produto
  inativo aparece desabilitado (reflete o toggle da área do estabelecimento).
- **Detalhe do produto** — adicionais agrupados com limite de seleção por
  grupo, quantidade e preço total dinâmico.
- **Carrinho** — editar quantidade, remover item, subtotal.
- **Login/Identificação** — **tem um seletor "Sou cliente" / "Sou da
  equipe"**: o modo cliente mostra entrar/criar conta; o modo equipe
  explica que o acesso é pelo painel administrativo e tem um botão que
  aponta para `http://localhost:5173` (ajustar para o domínio real em
  produção). O carrinho só exige login no momento do checkout, não para
  navegar o cardápio.
- **Entrega ou retirada** — escolha do tipo, seleção de endereço salvo ou
  cadastro de um novo, com taxa de entrega calculada pela distância
  (mesmas faixas da área do estabelecimento).
- **Pagamento + cupom** — Pix ou pagamento na entrega, aplicação de cupom
  (percentual, valor fixo ou frete grátis) com validação de pedido mínimo.
- **Confirmação** — resumo após o pedido ser gerado.
- **Acompanhamento** — linha do tempo com os mesmos estágios da área do
  estabelecimento (Recebido → Em produção → Saiu para entrega → Entregue).
- **Histórico** — pedidos anteriores.
- **Perfil** e **Endereços** — dados da conta e endereços salvos.

## Próximos passos sugeridos

1. Trocar `AuthContext` por autenticação real (JWT) contra o backend,
   com uma tabela de usuários que tenha um campo de papel/role
   (`cliente` vs `admin`/`equipe`) — a UI de login já está pronta pra
   isso, só falta a chamada à API.
2. Trocar `enderecosSalvos`/`calcularTaxaEntrega` por geocoding real.
3. Conectar `Acompanhamento` a polling/WebSocket para refletir o status
   real do pedido, atualizado pela área do estabelecimento.
