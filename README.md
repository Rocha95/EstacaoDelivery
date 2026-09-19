# Sistema de Pedidos e Delivery

Monorepo do sistema: painel do estabelecimento e app do cliente, cada um
com seu próprio frontend e backend, compartilhando um único banco de
dados (via `packages/database`).

## Por que cada sistema tem seu próprio backend?

Painel e cliente atendem públicos muito diferentes. O backend do painel
expõe operações administrativas (gerenciar produtos, ver todos os
pedidos, relatórios, usuários da equipe); o backend do cliente expõe só
o que faz sentido pra um consumidor externo acessar (cardápio público,
criar pedido, validar cupom, endereços da própria conta). Separar os
dois evita que uma rota administrativa fique acessível por engano pelo
app público, e permite deployar/escalar cada API de forma independente.

O que as duas áreas realmente compartilham é o **modelo de dados** — daí
o schema Prisma viver em `packages/database`, um pacote só, importado
pelos dois backends.

## Estrutura

```
sistema-delivery/
├── package.json                 # raiz: define os workspaces npm
├── packages/
│   ├── shared-ui/
│   │   └── tokens.css           # cores e tipografia compartilhadas entre os dois frontends
│   └── database/
│       ├── prisma/schema.prisma # modelo de dados único
│       ├── prisma/seed.js
│       └── src/index.js         # exporta o client Prisma já configurado
├── painel/
│   ├── frontend/                 # React — porta 5173
│   └── backend/                   # Express — porta 3333 — rotas administrativas
└── cliente/
    ├── frontend/                  # React — porta 5174
    └── backend/                    # Express — porta 3334 — rotas públicas/do consumidor
```

## Como rodar

```bash
npm install                  # instala as dependências de todos os workspaces

cp packages/database/.env.example packages/database/.env   # ajuste com seu Postgres
npm run db:migrate
npm run db:seed

npm run dev:painel:backend    # terminal 1 — http://localhost:3333/api
npm run dev:painel:frontend   # terminal 2 — http://localhost:5173
npm run dev:cliente:backend   # terminal 3 — http://localhost:3334/api
npm run dev:cliente:frontend  # terminal 4 — http://localhost:5174
```

Hoje os dois frontends ainda usam dados mock em memória
(`src/data/mock.js`). O próximo passo é trocar essas chamadas mock pelas
chamadas HTTP às APIs correspondentes.

## Próximos passos

1. Trocar os mocks de `painel/frontend` e `cliente/frontend` pelas
   chamadas às APIs.
2. Autenticação de verdade (JWT): `cliente/backend` já tem
   `POST /api/auth/entrar` e `/cadastrar`, falta emitir um token e os
   dois backends validarem quem está chamando (`Usuario.tipo`/`papel`
   já existem no schema pra isso).
3. Geocoding real para calcular `distanciaKm` de um endereço novo.
