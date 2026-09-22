# Casos de QA — PIX / Aguardando Pagamento

| ID | Cenário | Resultado esperado |
|---|---|---|
| PIX-001 | Criar pedido PIX | Pedido nasce como AGUARDANDO_PAGAMENTO |
| PIX-002 | Criar PIX manual | QR Code + Copia e Cola disponíveis |
| PIX-003 | Criar PIX Mercado Pago | Cobrança e QR Code disponíveis |
| PIX-004 | Ver contador | Aproximadamente 10 minutos |
| PIX-005 | Fechar navegador | Expiração continua sendo controlada pelo backend |
| PIX-006 | Não pagar por 10 minutos | Pedido CANCELADO / pagamento EXPIRADO |
| PIX-007 | Pedido com estoque controlado expira | Estoque é estornado |
| PIX-008 | Confirmar PIX manual no Painel | Pedido muda para RECEBIDO |
| PIX-009 | Mercado Pago aprova | Pedido muda para RECEBIDO |
| PIX-010 | PIX pendente tenta iniciar produção | Operação bloqueada com mensagem amigável |
| PIX-011 | PIX pendente aparece no KDS | Não aparece como pedido de produção |
| PIX-012 | PIX aprovado + agendamento futuro | Continua bloqueado até horário agendado |
| PIX-013 | Pagamento depois da expiração | Pedido continua CANCELADO; não reabrir automaticamente |
| PIX-014 | Dois processos tentam expirar o mesmo pedido | Estoque deve ser estornado uma única vez |
| PIX-015 | Pedido não PIX | Fluxo normal RECEBIDO -> EM_PRODUCAO |
