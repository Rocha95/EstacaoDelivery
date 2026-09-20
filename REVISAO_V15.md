# Estação Delivery V15 — recursos profissionais

## Implementado

1. Pagamento online via Pix com Mercado Pago
   - Criação server-side em `/v1/payments`.
   - Idempotency-Key por pedido.
   - QR Code, QR Code Base64, Pix Copia e Cola e ticket URL.
   - Webhook `/api/pagamentos/webhook` e consulta autenticada do pagamento.
   - Sem credencial, o fluxo antigo de Pix manual continua disponível.

2. KDS / Cozinha
   - Nova tela `/cozinha` no Painel.
   - Pedidos RECEBIDO e EM_PRODUCAO.
   - Atualização automática a cada 10s.
   - Botão Iniciar produção.

3. Estoque / esgotado
   - Produto: controlaEstoque, estoqueAtual e estoqueMinimo.
   - Movimentações de entrada, saída e ajuste.
   - Baixa automática na criação do pedido.
   - Baixa dos componentes de combos.
   - Estorno de estoque em cancelamento.
   - Cliente exibe Esgotado e bloqueia inclusão.

4. Fidelidade
   - Pontos configuráveis em Configurações.
   - Crédito automático ao finalizar pedido.
   - Histórico de movimentações.
   - Tela Cliente `/fidelidade`.
   - Pontuação isolada por estabelecimento.

5. Avaliações
   - Cliente avalia somente pedido FINALIZADO.
   - Uma avaliação por pedido.
   - Nota de 1 a 5 e comentário.
   - Painel lista e permite responder.

6. WhatsApp
   - Serviço opcional via Evolution API.
   - Notificações de recebimento, produção, saída para entrega, finalização e cancelamento.
   - Desligado por padrão até configurar as variáveis do ambiente.

7. Multi-estabelecimento
   - Nova entidade Estabelecimento.
   - Catálogo, pedidos, categorias, produtos, adicionais, combos, horários, cupons, taxas e configurações possuem tenant.
   - Backend resolve tenant por `X-Estabelecimento-Id`, slug, query `estabelecimentoId` ou `ESTABELECIMENTO_ID`.
   - Painel possui tela de seleção/criação de estabelecimentos.
   - Cliente pode usar `VITE_ESTABELECIMENTO_ID` com id ou slug.
   - Configuração, fidelidade e estoque ficam isolados por estabelecimento.

## Migration

Nova migration:
`20260920200000_delivery_pro_features`

Execute na raiz:

```bash
npm install
npm run prisma:generate --workspace packages/database
npm run db:migrate
```

Não rode `db:seed` em banco com dados reais.

## Pagamento online

Para ativar Mercado Pago:

```env
PAYMENT_PROVIDER=mercadopago
MP_ACCESS_TOKEN=APP_USR-...
MP_WEBHOOK_URL=https://seu-dominio.com/api/pagamentos/webhook
```

A chave privada permanece somente no backend.

## WhatsApp

```env
WHATSAPP_ENABLED=true
EVOLUTION_API_URL=http://seu-servidor-evolution
EVOLUTION_INSTANCE=estacao
EVOLUTION_API_KEY=...
```

## Observação

O código de pagamento online está preparado para Pix Mercado Pago. Cartão online exige uma etapa adicional de captura segura de dados/tokenização no frontend e foi mantido fora do formulário próprio para não expor dados sensíveis ao backend.
