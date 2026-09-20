# Matriz de testes funcional – Estacao Delivery

A matriz abaixo deve ser usada como checklist de homologação e base para automação.

## 1. Infraestrutura e disponibilidade

| ID | Área | Cenário | Resultado esperado | Pri. |
|---|---|---|---|---|
| INF-001 | Backend Cliente | iniciar serviço | processo sobe sem exceção | P0 |
| INF-002 | Backend Painel | iniciar serviço | processo sobe sem exceção | P0 |
| INF-003 | Cliente API | GET `/api/` | `200` e `ok=true` | P0 |
| INF-004 | Banco | conectar Prisma | conexão sem erro | P0 |
| INF-005 | Front Cliente | build | Vite conclui sem erro | P0 |
| INF-006 | Front Painel | build | Vite conclui sem erro | P0 |
| INF-007 | Env | iniciar sem segredo obrigatório | erro explícito e seguro | P1 |
| INF-008 | CORS | origem permitida | requisição aceita | P1 |
| INF-009 | CORS | origem não permitida | bloqueada | P1 |

## 2. Cliente – conta

| ID | Cenário | Resultado esperado | Pri. |
|---|---|---|---|
| CLI-AUTH-001 | cadastro válido | 201 + token | P0 |
| CLI-AUTH-002 | telefone duplicado | 409 | P1 |
| CLI-AUTH-003 | e-mail duplicado | 409 | P1 |
| CLI-AUTH-004 | senha < 6 | 400 | P1 |
| CLI-AUTH-005 | nome inválido | 400 | P2 |
| CLI-AUTH-006 | login válido | token funcional | P0 |
| CLI-AUTH-007 | senha errada | 401 | P0 |
| CLI-AUTH-008 | usuário inexistente | 401 | P1 |
| CLI-AUTH-009 | `/auth/me` sem token | 401 | P0 |
| CLI-AUTH-010 | token inválido | 401 | P0 |
| CLI-AUTH-011 | token expirado | 401 | P1 |

## 3. Cliente – catálogo

| ID | Cenário | Resultado esperado | Pri. |
|---|---|---|---|
| CAT-001 | listar categorias | somente tenant atual | P0 |
| CAT-002 | listar produtos | produtos ativos do tenant | P0 |
| CAT-003 | buscar produto inexistente | 404/resultado controlado | P1 |
| CAT-004 | produto inativo | não aparece no catálogo | P1 |
| CAT-005 | produto fora do horário | não pode ser pedido | P1 |
| CAT-006 | estoque zero | aparece como esgotado e não permite compra | P0 |
| CAT-007 | combo válido | componentes/preço corretos | P1 |
| CAT-008 | combo com componente sem estoque | compra bloqueada | P0 |
| CAT-009 | adicional válido | preço somado corretamente | P1 |
| CAT-010 | adicional duplicado | pedido bloqueado | P1 |
| CAT-011 | adicional de outra categoria | pedido bloqueado | P1 |

## 4. Cliente – endereço e entrega

| ID | Cenário | Resultado esperado | Pri. |
|---|---|---|---|
| END-001 | listar endereços autenticado | somente próprios | P0 |
| END-002 | listar sem token | 401 | P0 |
| END-003 | criar endereço válido | 201 | P0 |
| END-004 | apagar próprio endereço | sucesso | P1 |
| END-005 | apagar endereço de outro cliente | 404/403 | P0 |
| ENT-001 | calcular taxa dentro do raio | valor correto | P0 |
| ENT-002 | endereço fora do raio | pedido bloqueado | P1 |
| ENT-003 | retirada | sem taxa | P0 |
| ENT-004 | delivery desativado | pedido bloqueado | P0 |
| ENT-005 | retirada desativada | pedido bloqueado | P1 |

## 5. Cliente – carrinho/checkout/pedido

| ID | Cenário | Resultado esperado | Pri. |
|---|---|---|---|
| PED-001 | pedido com produto válido | 201 | P0 |
| PED-002 | lista de itens vazia | 400 | P1 |
| PED-003 | quantidade 0 | 400 | P1 |
| PED-004 | quantidade 100 | 400 | P1 |
| PED-005 | produto inexistente | 400 | P0 |
| PED-006 | produto de outro tenant | 400 | P0 |
| PED-007 | pedido abaixo do mínimo | 400 | P1 |
| PED-008 | cupom percentual | desconto correto | P1 |
| PED-009 | cupom expirado | 400 | P1 |
| PED-010 | cupom de outro tenant | 400 | P0 |
| PED-011 | frete grátis | taxa = 0 | P1 |
| PED-012 | PIX manual | pagamento PENDENTE | P1 |
| PED-013 | PIX Mercado Pago | Payment criado | P0 |
| PED-014 | cartão na entrega | pedido criado | P1 |
| PED-015 | dinheiro na entrega | pedido criado | P1 |
| PED-016 | agendamento < 30 min | 400 | P1 |
| PED-017 | agendamento > 7 dias | 400 | P2 |
| PED-018 | pedido sem endereço delivery | 400 | P0 |
| PED-019 | usuário consulta pedido próprio | 200 | P0 |
| PED-020 | usuário consulta pedido de outro | 404 | P0 |
| PED-021 | retry do checkout | não deve duplicar pedido | P0 |

## 6. Pagamento

| ID | Cenário | Resultado esperado | Pri. |
|---|---|---|---|
| PAY-001 | PIX sem Mercado Pago | Payment MANUAL | P1 |
| PAY-002 | PIX Mercado Pago | QR/copia-e-cola/ticket quando fornecidos | P0 |
| PAY-003 | token MP ausente | erro controlado sem vazar segredo | P0 |
| PAY-004 | webhook aprovado | pedido/payment APROVADO | P0 |
| PAY-005 | webhook rejeitado | status REJEITADO | P0 |
| PAY-006 | webhook repetido | idempotente | P0 |
| PAY-007 | webhook desconhecido | resposta segura | P1 |
| PAY-008 | pedido PIX pendente | painel não inicia produção | P0 |
| PAY-009 | pagamento cancelado | pedido não avança indevidamente | P0 |

## 7. Painel – cadastro/configuração

| ID | Cenário | Resultado esperado | Pri. |
|---|---|---|---|
| ADM-001 | listar categorias | tenant correto | P1 |
| ADM-002 | criar categoria | persistência | P1 |
| ADM-003 | criar produto | persistência | P0 |
| ADM-004 | editar produto | dados atualizados | P1 |
| ADM-005 | inativar produto | desaparece do catálogo | P0 |
| ADM-006 | estoque controlado | campos persistidos | P0 |
| ADM-007 | criar adicional | persistência | P1 |
| ADM-008 | criar combo | componentes corretos | P1 |
| ADM-009 | configurar horário | regra aplicada | P1 |
| ADM-010 | configurar taxa | cálculo aplicado | P1 |
| ADM-011 | configurar pedido mínimo | checkout respeita | P1 |
| ADM-012 | configurar pontos | fidelidade respeita | P1 |
| ADM-013 | ativar WhatsApp | serviço usa configuração | P2 |

## 8. Estoque

| ID | Cenário | Resultado esperado | Pri. |
|---|---|---|---|
| EST-001 | entrada | saldo aumenta | P0 |
| EST-002 | saída | saldo diminui | P0 |
| EST-003 | ajuste | saldo correto | P1 |
| EST-004 | venda | saldo reduz e movimento criado | P0 |
| EST-005 | cancelamento | saldo restaurado e ESTORNO criado | P0 |
| EST-006 | estoque insuficiente | pedido rejeitado | P0 |
| EST-007 | dois pedidos simultâneos | saldo nunca fica negativo | P0 |
| EST-008 | combo | componentes baixados | P0 |
| EST-009 | combo cancelado | componentes restaurados | P0 |
| EST-010 | produto sem controle | estoque não bloqueia venda | P1 |

## 9. KDS/Cozinha

| ID | Cenário | Resultado esperado | Pri. |
|---|---|---|---|
| KDS-001 | listar pedidos | somente etapas de cozinha | P0 |
| KDS-002 | iniciar produção | RECEBIDO → EM_PRODUCAO | P0 |
| KDS-003 | transição inválida | bloqueada | P0 |
| KDS-004 | PIX pendente | não inicia produção | P0 |
| KDS-005 | pedido agendado futuro | não inicia | P1 |
| KDS-006 | avançar entrega | EM_PRODUCAO → SAIU_PARA_ENTREGA | P0 |
| KDS-007 | finalizar | SAIU_PARA_ENTREGA → FINALIZADO | P0 |
| KDS-008 | cancelar finalizado | bloqueado | P1 |

## 10. Fidelidade

| ID | Cenário | Resultado esperado | Pri. |
|---|---|---|---|
| FID-001 | pedido finalizado | pontos creditados | P0 |
| FID-002 | pontos calculados | regra R$ configurada | P1 |
| FID-003 | histórico | movimento do pedido aparece | P1 |
| FID-004 | dois estabelecimentos | saldos independentes | P0 |
| FID-005 | cancelamento | não duplicar pontos | P0 |

## 11. Avaliações

| ID | Cenário | Resultado esperado | Pri. |
|---|---|---|---|
| AVL-001 | avaliar pedido finalizado | 201 | P1 |
| AVL-002 | nota 1 | aceita | P2 |
| AVL-003 | nota 5 | aceita | P2 |
| AVL-004 | nota 0 | bloqueada | P1 |
| AVL-005 | nota 6 | bloqueada | P1 |
| AVL-006 | pedido não finalizado | bloqueado | P1 |
| AVL-007 | pedido de outro cliente | bloqueado | P0 |
| AVL-008 | segunda avaliação | bloqueada | P1 |
| AVL-009 | responder no painel | resposta persistida | P2 |

## 12. Multi-tenant / segurança

| ID | Cenário | Resultado esperado | Pri. |
|---|---|---|---|
| TEN-001 | tenant A catálogo | somente A | P0 |
| TEN-002 | tenant B catálogo | somente B | P0 |
| TEN-003 | ID A + recurso B | bloqueado | P0 |
| TEN-004 | pedido A + painel B | não aparece | P0 |
| TEN-005 | fidelidade A/B | saldos isolados | P0 |
| TEN-006 | cupom A usado em B | bloqueado | P0 |
| TEN-007 | produto A enviado no pedido B | bloqueado | P0 |
| TEN-008 | tenant inexistente | 404/400 | P1 |
| TEN-009 | tenant inativo | bloqueado | P0 |
| SEC-001 | JWT inválido | 401 | P0 |
| SEC-002 | IDOR pedido | bloqueado | P0 |
| SEC-003 | IDOR endereço | bloqueado | P0 |
| SEC-004 | SQL/NoSQL injection em campos | sem execução indevida | P0 |
| SEC-005 | XSS em observações/comentários | conteúdo tratado | P1 |
| SEC-006 | segredo MP no bundle frontend | não encontrado | P0 |
| SEC-007 | stack trace ao cliente | não expõe segredo/caminho | P1 |

## 13. WhatsApp

| ID | Cenário | Resultado esperado | Pri. |
|---|---|---|---|
| WPP-001 | desativado | pedido não quebra | P0 |
| WPP-002 | ativado/config inválida | pedido continua, erro isolado | P1 |
| WPP-003 | recebido | mensagem enviada | P2 |
| WPP-004 | produção | mensagem enviada | P2 |
| WPP-005 | entrega | mensagem enviada | P2 |
| WPP-006 | finalizado | mensagem enviada | P2 |
| WPP-007 | cancelado | mensagem enviada | P2 |

## 14. Regressão visual/usabilidade

- responsividade 360x800, 390x844, 768x1024, 1366x768 e 1920x1080;
- teclado sem mouse;
- foco visível;
- mensagens de erro compreensíveis;
- loading sem clique duplicado;
- botões desabilitados enquanto requisição está em andamento;
- refresh sem perder sessão válida;
- logout limpa sessão;
- links/rotas protegidas não permitem acesso indevido;
- imagens quebradas não impedem a compra;
- console sem erros JS durante a jornada principal.
