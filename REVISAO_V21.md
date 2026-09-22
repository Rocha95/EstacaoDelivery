# Revisão V21 — Fluxo de PIX com Aguardando Pagamento

## Objetivo
Separar o estado do pedido do estado do pagamento e impedir que pedidos PIX entrem na operação antes da confirmação do pagamento.

## Regras implementadas

- Novo status do pedido: `AGUARDANDO_PAGAMENTO`.
- Pedido PIX nasce em `AGUARDANDO_PAGAMENTO`.
- Pagamentos PIX recebem validade de 10 minutos (`pagamentos.expiraEm`).
- Rotina automática no backend verifica expirações a cada 15 segundos.
- Após expiração, pedido vira `CANCELADO` e pagamento vira `EXPIRADO`.
- Estoque reservado pelo pedido é estornado quando o PIX expira.
- PIX manual pode ser confirmado pelo Painel.
- Mercado Pago pode promover automaticamente `AGUARDANDO_PAGAMENTO` para `RECEBIDO` quando o pagamento for aprovado.
- Polling do Cliente consulta o pagamento periodicamente.
- Cliente exibe contador regressivo, QR Code e Pix Copia e Cola.
- Cliente informa claramente o cancelamento por expiração.
- KDS e avanço de status bloqueiam pedidos sem pagamento aprovado.
- Dashboard do Painel possui coluna e indicador para pagamentos pendentes.
- Tela de Pedidos permite confirmar PIX manual.
- Pagamentos recebidos depois do cancelamento permanecem registrados como pagamento aprovado, sem reabrir o pedido automaticamente.

## Fluxo

PIX -> AGUARDANDO_PAGAMENTO -> pagamento aprovado -> RECEBIDO -> EM_PRODUCAO -> SAIU_PARA_ENTREGA -> FINALIZADO

PIX -> AGUARDANDO_PAGAMENTO -> 10 minutos sem pagamento -> CANCELADO

## Migração

Nova migration:
`packages/database/prisma/migrations/20260921210000_pix_aguardando_pagamento/migration.sql`

Executar:

```bash
npm install
npm run prisma:generate --workspace packages/database
npm run db:migrate
```

Não executar seed em banco de produção.

## Testes de regressão

- Cliente cria PIX e recebe `AGUARDANDO_PAGAMENTO`.
- QR Code e Pix Copia e Cola aparecem.
- Contador regressivo começa em aproximadamente 10:00.
- Sem pagamento, pedido é cancelado após a expiração.
- Estoque é estornado na expiração.
- PIX manual confirmado no Painel muda pedido para `RECEBIDO`.
- PIX Mercado Pago aprovado muda pedido para `RECEBIDO`.
- Pedido `AGUARDANDO_PAGAMENTO` não aparece no KDS.
- Pedido sem pagamento aprovado não entra em produção.
- Pedido agendado continua bloqueado até o horário mesmo depois do pagamento.
- Pagamento aprovado após cancelamento não reabre automaticamente o pedido.
