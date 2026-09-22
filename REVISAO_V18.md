# Revisão V18 — Correções de pedidos e estabelecimentos

## Correções

- Corrigida a apresentação do tipo de recebimento no Painel: agora usa `tipoEntrega` e os valores reais `DELIVERY`/`RETIRADA`.
- Corrigida a apresentação da forma de pagamento: agora usa `formaPagamento`.
- Corrigido o `StatusPill`, que estava dependente de um mock antigo com chaves incompatíveis com o enum real do banco.
- Tela de Pedidos recebeu tratamento de erro, botão de nova tentativa, busca por número/cliente e atualização de status por uma única rota canônica.
- Backend do Cliente agora normaliza `tipoEntrega` recebido em maiúsculas/minúsculas antes da validação.
- Tela de Estabelecimentos foi reescrita com linguagem mais amigável: “Lojas e unidades”, “Nome da loja”, “Identificador da loja”, “Minhas lojas”, “Loja atual” e “Administrar esta loja”.
- Casos de regressão foram adicionados à matriz de QA.

## Observação

A implementação do backend já armazenava `DELIVERY` corretamente quando o Cliente enviava esse valor. Um dos problemas observados no Painel era de apresentação: o componente consultava `o.tipo`, campo que não existe no modelo `Pedido`, fazendo qualquer pedido cair visualmente no texto alternativo “Retirada”.
