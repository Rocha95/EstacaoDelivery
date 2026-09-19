# @sistema-delivery/database

Schema Prisma único do sistema, compartilhado por `painel/backend` e
`cliente/backend`. Um banco de dados só — é aqui que as duas áreas do
sistema realmente se encontram.

## Como usar

```bash
cd packages/database
cp .env.example .env      # ajuste com seu Postgres
npm run prisma:migrate    # cria as tabelas
npm run seed               # popula com dados de exemplo
npm run prisma:studio      # (opcional) navegar no banco
```

Os backends importam o cliente já configurado:

```js
import { prisma } from '@sistema-delivery/database'
```
