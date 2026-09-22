# V19 — Tratamento amigável de pedidos agendados

- Bloqueio de avanço de pedidos agendados antes do horário no Painel.
- Mesma regra aplicada ao KDS/Cozinha.
- Botões passam a mostrar `Aguardando horário` quando aplicável.
- Mensagem amigável informa data e horário do agendamento e explica quando a produção poderá começar.
- Erro HTTP de agendamento usa status 409.
- Adicionados casos de regressão PED-AGD-001 a PED-AGD-006.
