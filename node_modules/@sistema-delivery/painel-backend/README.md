# painel/backend — API administrativa

Express + Prisma (schema compartilhado em `packages/database`). Rotas
usadas pelo `painel/frontend` — quem chama essa API é a equipe do
estabelecimento, não o cliente final.

## Endpoints

| Tela do painel     | Rotas |
|---|---|
| Categorias         | `GET/POST /api/categorias`, `PUT/DELETE /api/categorias/:id` |
| Produtos           | `GET/POST /api/produtos`, `GET/PUT/DELETE /api/produtos/:id`, `PATCH /api/produtos/:id/ativo` |
| Adicionais         | `GET/POST /api/adicionais/grupos`, `PUT/DELETE /api/adicionais/grupos/:id`, `POST /api/adicionais/grupos/:grupoId/opcoes`, `PUT/DELETE /api/adicionais/opcoes/:id`, `PATCH /api/adicionais/opcoes/:id/ativo` |
| Combos             | `GET/POST /api/combos`, `PATCH /api/combos/:id/ativo`, `DELETE /api/combos/:id` |
| Horários           | `GET /api/horarios`, `PUT /api/horarios/:diaSemana` (0=domingo...6=sábado) |
| Cupons             | `GET/POST /api/cupons`, `PUT/DELETE /api/cupons/:id`, `PATCH /api/cupons/:id/ativo` |
| Taxas de entrega   | `GET/POST /api/taxas-entrega/faixas`, `PUT/DELETE /api/taxas-entrega/faixas/:id` |
| Clientes           | `GET /api/clientes`, `GET /api/clientes/:id` |
| Configurações      | `GET/PUT /api/configuracoes` |
| Usuários (equipe)  | `GET/POST /api/usuarios`, `PUT/DELETE /api/usuarios/:id`, `PATCH /api/usuarios/:id/ativo` |
| Pedidos            | `GET /api/pedidos`, `GET /api/pedidos/:id`, `PATCH /api/pedidos/:id/avancar`, `PATCH /api/pedidos/:id/cancelar` |
| Relatórios         | `GET /api/relatorios/resumo?dias=`, `GET /api/relatorios/vendas-por-dia?dias=`, `GET /api/relatorios/mais-vendidos?limite=` |

> Criar pedido, validar cupom e calcular taxa de entrega ficam em
> `cliente/backend` — são operações do consumidor final, não da equipe.

## Como rodar

```bash
npm install    # (na raiz do monorepo, uma vez só)
npm run dev:painel:backend    # a partir da raiz
# ou, de dentro desta pasta:
npm run dev
```

Sobe em `http://localhost:3333/api`. Requer o banco configurado em
`packages/database` (veja o README de lá).

## O que falta

- Autenticação: nenhuma rota aqui checa `Usuario.papel` ainda — qualquer
  chamada passa. Precisa de um middleware de sessão/JWT que só deixe
  `tipo: EQUIPE` acessar.
