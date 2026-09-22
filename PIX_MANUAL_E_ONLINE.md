# PIX — Estação Delivery

## PIX manual

Quando `PAYMENT_PROVIDER` não está definido como `mercadopago`, o sistema utiliza a chave Pix cadastrada em **Painel → Configurações → Chave Pix do estabelecimento**.

Ao criar um pedido PIX, o backend gera o payload BR Code com valor, estabelecimento e identificador do pedido, além do QR Code e Pix Copia e Cola.

## PIX Mercado Pago

Quando `PAYMENT_PROVIDER=mercadopago`, o backend cria o pagamento no Mercado Pago e utiliza os dados retornados pelo gateway.

O Access Token permanece somente no backend.

## Migração

É necessário executar a migration que adiciona `chavePix` à tabela `configuracoes` e gerar novamente o Prisma Client.

```bash
npm install
npm run prisma:generate --workspace packages/database
npm run db:migrate
```

Não execute o seed em banco de produção.
