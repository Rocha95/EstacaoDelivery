# Estação Delivery — versão refatorada

Esta versão evolui o projeto para um delivery próprio com foco em consistência de preços no backend, geolocalização, cálculo de rota, agendamento e recompra.

## Antes de executar

1. Copie os arquivos `.env.example` para `.env` nos backends.
2. Configure `DATABASE_URL` e `JWT_SECRET`.
3. No Cliente, configure `PAINEL_PUBLIC_URL` apontando para o backend do Painel.
4. Configure um `GEOCODING_USER_AGENT` identificando sua aplicação.
5. O cálculo rodoviário usa OSRM por padrão. Para produção, prefira uma instância própria ou um provedor de rotas adequado ao volume.
6. Execute:

```bash
npm install
npm run db:migrate
npm run db:generate --workspace packages/database
```

## Fluxo de entrega

- O estabelecimento informa seu endereço na tela de Configurações.
- O endereço é salvo no PostgreSQL.
- O backend geocodifica o endereço e salva latitude/longitude.
- O cliente cadastra seu endereço.
- O sistema geocodifica o endereço do cliente.
- O backend calcula a distância pela rota rodoviária.
- A distância é comparada ao raio máximo configurado.
- A faixa de entrega define o valor do frete.
- No fechamento, tudo é recalculado no backend.

## Recursos adicionados

- Distância real por rota rodoviária.
- Fallback para Haversine quando o serviço de rotas não responder.
- Endereço do estabelecimento persistido no banco.
- Geocodificação automática do estabelecimento.
- Agendamento de pedidos.
- Bloqueio de avanço de pedido agendado antes do horário.
- Repetir pedido pelo histórico.
- Identificação visual de pedidos agendados no Painel.
- Imagens do catálogo servidas pelo backend do Painel.

Veja `ALTERACOES_V3.md` para o inventário completo.
