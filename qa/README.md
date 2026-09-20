# QA / Testes - Estacao Delivery

Este diretório implementa uma rotina de QA em camadas para o Estacao Delivery, separando testes estáticos, API, integração, E2E, regressão, segurança, concorrência, dados e aceite.

## Filosofia

Nenhum teste automatizado deve ser executado contra produção por padrão. Os testes que criam usuário/endereço/pedido ficam protegidos por `ALLOW_MUTATION=true` e devem apontar para um banco de homologação.

### Pirâmide

1. **Smoke** – aplicação sobe, endpoints críticos respondem.
2. **Static** – sintaxe JS, arquivos obrigatórios, configuração e inconsistências conhecidas.
3. **API/Integração** – autenticação, catálogo, endereços, pedidos, pagamentos, fidelidade, avaliações, tenant e painel.
4. **E2E** – jornada real Cliente → Pedido → Painel → Cozinha → Finalização → Fidelidade/Avaliação.
5. **Regressão** – execução de todos os casos críticos a cada release.
6. **Segurança** – autenticação, autorização, isolamento de tenant, IDOR, validação de entrada e exposição de segredos.
7. **Confiabilidade** – concorrência de estoque, idempotência, indisponibilidade de integrações e recuperação.
8. **Performance** – carga de catálogo, pedidos simultâneos e consultas do painel.

## Ambientes

- `DEV`: desenvolvimento local.
- `HML`: homologação, banco exclusivo para testes.
- `PROD`: somente smoke não destrutivo e observabilidade.

## Execução rápida

Na raiz:

```bash
npm install
npm run qa:static
npm run qa:smoke
```

Para API completa:

```bash
QA_CLIENTE_URL=http://localhost:3334 \
QA_PAINEL_URL=http://localhost:3333 \
QA_ESTABELECIMENTO=default \
ALLOW_MUTATION=true \
npm run qa:api
```

> `ALLOW_MUTATION=true` só deve ser usado em homologação/teste.

## Pré-requisitos

1. PostgreSQL disponível.
2. Migrações aplicadas.
3. Cliente backend em `3334`.
4. Painel backend em `3333`.
5. Frontends disponíveis quando executar E2E.
6. Variáveis `.env` configuradas.

## Critério de aprovação da release

- Zero falhas em smoke.
- Zero falhas em casos críticos P0/P1.
- Nenhum vazamento entre estabelecimentos.
- Nenhum estoque negativo.
- Nenhum pedido duplicado por retry.
- Nenhum segredo exposto no frontend.
- Build do Cliente e Painel concluindo sem erro.
- Evidências anexadas para todos os bugs encontrados.

## Severidade

- **P0 – Bloqueante:** perda de dados/dinheiro, pedido duplicado, falha geral, vulnerabilidade crítica.
- **P1 – Crítico:** jornada principal quebrada, pedido não pode ser concluído, estoque/pagamento incorreto.
- **P2 – Alto:** funcionalidade importante parcialmente quebrada, workaround razoável.
- **P3 – Médio:** erro não crítico, UX ou regra de negócio secundária.
- **P4 – Baixo:** visual, texto, melhoria.

## Resultado esperado

Cada execução deve gerar um relatório em `qa/reports/` contendo:

- data/hora;
- ambiente;
- commit/release;
- casos executados;
- PASS/FAIL/SKIP;
- duração;
- endpoint/tela;
- evidência;
- erro técnico;
- severidade sugerida.

Consulte `docs/MATRIZ_TESTES.md`, `docs/PLANO_REGRESSAO.md` e `docs/BUG_REPORT.md`.
