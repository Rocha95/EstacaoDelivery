# E2E com navegador

A camada E2E deve ser executada com Playwright em homologação. O objetivo é validar a jornada completa e não somente endpoints.

## Jornadas obrigatórias

1. Cliente: cadastro → login → catálogo → produto → carrinho → checkout → confirmação.
2. Painel: login/acesso → pedido recebido → KDS → produção → entrega → finalização.
3. Estoque: produto controlado → venda → saldo → cancelamento → estorno.
4. Fidelidade: pedido finalizado → pontos → histórico.
5. Avaliação: pedido finalizado → nota/comentário → painel responde.
6. Multi-tenant: tenant A não pode visualizar/modificar dados de B.
7. Falha de integração: WhatsApp/MP indisponíveis não podem derrubar a jornada quando configurados como opcionais.

## Evidências

Em toda falha, salvar:
- screenshot;
- vídeo;
- trace Playwright;
- console;
- requests/responses relevantes;
- horário;
- usuário/tenant de teste;
- ID do pedido.

Os testes E2E são deliberadamente separados dos testes API para que uma falha visual não esconda uma falha de backend.
