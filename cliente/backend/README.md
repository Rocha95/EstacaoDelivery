# cliente/backend — API pública / do consumidor

Express + Prisma (schema compartilhado em `packages/database`). Rotas
usadas pelo `cliente/frontend` — só o que faz sentido um consumidor
externo acessar (cardápio, checkout, a própria conta).

## Endpoints

| Tela do cliente        | Rotas |
|---|---|
| Cardápio               | `GET /api/categorias`, `GET /api/produtos`, `GET /api/produtos/:id`, `GET /api/combos` (só itens ativos) |
| Informações da loja    | `GET /api/configuracao`, `GET /api/horarios` |
| Login/Cadastro         | `POST /api/auth/entrar`, `POST /api/auth/cadastrar` |
| Endereços              | `GET /api/enderecos?usuarioId=`, `POST /api/enderecos`, `DELETE /api/enderecos/:id` |
| Cupom (checkout)       | `POST /api/cupons/validar` |
| Taxa de entrega        | `GET /api/taxas-entrega/calcular?distanciaKm=` |
| Pedido (checkout)      | `POST /api/pedidos` |
| Histórico              | `GET /api/pedidos?clienteId=` |
| Acompanhamento         | `GET /api/pedidos/:id` |

## Como rodar

```bash
npm install    # (na raiz do monorepo, uma vez só)
npm run dev:cliente:backend    # a partir da raiz
# ou, de dentro desta pasta:
npm run dev
```

Sobe em `http://localhost:3334/api`. Requer o banco configurado em
`packages/database` (veja o README de lá) — é o **mesmo banco** que o
`painel/backend` usa.

## O que falta

- `POST /api/auth/entrar` hoje devolve os dados do usuário sem token
  nenhum — o front guarda isso em memória. Falta emitir um JWT e os
  outros endpoints (`/enderecos`, `/pedidos`) passarem a confiar nele em
  vez de receber `usuarioId`/`clienteId` direto no corpo da requisição.
- Geocoding real: `distanciaKm` de um endereço novo é só um número que o
  front manda solto hoje.
