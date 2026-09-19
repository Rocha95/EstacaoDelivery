# Estação Delivery — alterações da versão 3

## 1. Distância real pelas ruas
- O cálculo de entrega deixou de usar somente distância em linha reta.
- O backend consulta uma API compatível com OSRM para obter a distância rodoviária entre o estabelecimento e o endereço do cliente.
- A distância retornada é armazenada em `Endereco.distanciaKm` para reaproveitamento.
- Se o serviço de rotas estiver indisponível, o sistema usa Haversine como fallback por padrão (`ROUTING_FALLBACK_HAVERSINE=true`).
- A decisão de cobertura e a taxa continuam sendo calculadas no backend, impedindo manipulação pelo navegador.
- Novo endpoint autenticado: `GET /api/rotas/endereco/:enderecoId`.

## 2. Endereço do estabelecimento no banco
- O endereço do estabelecimento permanece em `Configuracao.endereco`, e não em código do frontend.
- Ao salvar o endereço no Painel, o backend tenta geocodificá-lo e salvar latitude/longitude automaticamente.
- O Cliente usa essas coordenadas como origem do cálculo da rota.
- A tela de Configurações agora deixa explícito que o endereço é a origem da entrega.

> Observação: a versão atual suporta corretamente diferentes estabelecimentos através de configurações/bases de cada implantação. Ela ainda não implementa multi-tenant completo dentro do mesmo banco (isolamento de catálogo/pedidos por estabelecimento). Essa evolução deve ser feita antes de oferecer um único banco para várias lojas.

## 3. Agendamento de pedidos
- Cliente pode escolher “o mais rápido possível” ou agendar data/hora.
- Backend valida o agendamento com mínimo de 30 minutos e máximo de 7 dias.
- O horário fica salvo em `Pedido.agendadoPara`.
- Nova migration: `20260919180000_delivery_road_distance`.
- Painel identifica pedidos agendados na coluna de horário.
- Tela de confirmação mostra a data/hora agendada.

## 4. Repetir pedido
- Histórico ganhou ação “Repetir pedido”.
- Os itens atuais são recolocados no carrinho.
- O backend continua sendo a autoridade de preço/disponibilidade ao finalizar o novo pedido.

## 5. Segurança e consistência mantidas
- Preços, adicionais, descontos, frete e total continuam sendo recalculados no backend.
- Endereço é sempre validado contra o usuário autenticado.
- Pedido é sempre consultado pelo usuário autenticado.
- Fotos continuam sendo servidas pelo backend do Painel, evitando duplicação dos arquivos.

## 6. Configuração adicional
No `.env` do backend Cliente:

```env
ROUTING_URL=https://router.project-osrm.org
ROUTING_USER_AGENT=EstacaoDelivery/1.0 contato@seudominio.com
ROUTING_FALLBACK_HAVERSINE=true
```

Para produção, é recomendável usar uma infraestrutura de rotas própria ou um provedor com SLA/limites adequados ao volume comercial, em vez de depender do servidor público de demonstração do OSRM.

## 7. Próximas evoluções recomendadas
- Multi-tenant real por `estabelecimentoId` no catálogo, equipe, cupons, taxas e pedidos.
- Pagamento online real via gateway (Pix/cartão) com webhook de confirmação.
- Notificações em tempo real com WebSocket/SSE.
- KDS/tela de cozinha.
- Controle de estoque/esgotamento.
- Combos e upsell/recomendação no carrinho.
- Programa de fidelidade.
- Avaliação do pedido/restaurante.
- Horários específicos de produtos/categorias e promoções.
- Área de entrega por bairros além da rota por distância.
- Observação de troco para pagamento em dinheiro.
- Cancelamento pelo cliente dentro de regras configuráveis.
