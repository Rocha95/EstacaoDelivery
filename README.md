# Estação Delivery

Monorepo com dois módulos usando o mesmo PostgreSQL/Prisma:

- `painel/frontend`: painel do estabelecimento (porta 5173)
- `painel/backend`: API do estabelecimento (porta 3333)
- `cliente/frontend`: aplicativo web do cliente (porta 5174)
- `cliente/backend`: API pública/autenticada do cliente (porta 3334)
- `packages/database`: Prisma/schema compartilhado

## Configuração

1. Crie `cliente/backend/.env` a partir de `cliente/backend/.env.example`.
2. Crie `painel/backend/.env` a partir de `painel/backend/.env.example`.
3. Garanta que `DATABASE_URL` aponta para o mesmo PostgreSQL usado pelos dois backends.
4. Defina uma `JWT_SECRET` forte no ambiente do cliente.
5. Gere o Prisma Client e aplique as alterações do schema:

```bash
npm install
npm run prisma:generate --workspace packages/database
npm run db:migrate
npm run db:seed
```

## Executar

Em terminais separados:

```bash
npm run dev:painel:backend
npm run dev:painel:frontend
npm run dev:cliente:backend
npm run dev:cliente:frontend
```

Cliente: `http://localhost:5174`

API Cliente: `http://localhost:3334/api`

Painel: `http://localhost:5173`

API Painel: `http://localhost:3333/api`

## Fluxo do cliente

1. Cliente consulta o catálogo no banco.
2. Login/cadastro gera JWT.
3. Endereços e pedidos são vinculados ao usuário autenticado.
4. O carrinho envia somente IDs de produtos/adicionais e quantidades.
5. A API valida disponibilidade, adicionais, pedido mínimo, cupom, frete e forma de pagamento.
6. O total é recalculado no servidor antes da gravação.
7. O mesmo pedido fica imediatamente disponível no Painel.
8. O acompanhamento consulta o status real do pedido periodicamente.

> O endereço precisa ter `distanciaKm` preenchida para o cálculo da taxa de entrega. Para uma operação real, recomenda-se substituir esse campo por cálculo automático por coordenadas/geocodificação.
