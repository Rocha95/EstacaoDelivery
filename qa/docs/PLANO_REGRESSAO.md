# Plano de regressão

## Antes de cada release

### Gate 1 – Static
- `npm run qa:static`
- `npm run build --workspace cliente/frontend`
- `npm run build --workspace painel/frontend`
- Prisma generate/validate

### Gate 2 – Smoke
- Cliente `/api/`
- catálogo
- login
- painel `/api/`
- banco acessível

### Gate 3 – Jornada crítica
1. cliente cadastra/loga;
2. consulta catálogo;
3. cadastra endereço;
4. monta carrinho;
5. cria pedido;
6. painel recebe pedido;
7. cozinha inicia;
8. pedido sai para entrega;
9. pedido finaliza;
10. pontos são creditados;
11. cliente avalia.

### Gate 4 – Regras críticas
- estoque;
- cupom;
- taxa;
- horário;
- PIX;
- cancelamento;
- multi-tenant.

### Gate 5 – Segurança
- IDOR;
- JWT;
- tenant isolation;
- segredos;
- payloads malformados.

## Smoke diário

Executar apenas testes não destrutivos.

## Regressão semanal

Executar toda a matriz funcional em homologação.

## Pré-produção

Executar a matriz completa + carga + testes de integração externa.

## Pós-deploy

Executar smoke em produção:
- health;
- catálogo;
- login de teste autorizado;
- leitura de configuração;
- observabilidade;
- nenhuma criação de pedido real sem aprovação.
