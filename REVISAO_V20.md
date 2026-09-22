# Estação Delivery — V20

## Correções solicitadas

### 1. Preview de imagens de produtos
Corrigida a resolução das imagens do Painel. Imagens gravadas como `/uploads/...` agora são exibidas através do backend do Painel (`localhost:3333`) em desenvolvimento. O mesmo tratamento é aplicado ao preview, edição e lista de produtos.

### 2. Preview de imagens de adicionais
Corrigida a resolução de imagens de adicionais para o backend de uploads do Painel. O preview local via `URL.createObjectURL` continua funcionando para arquivos recém-selecionados.

### 3. Preview de imagens de combos
Corrigida a resolução das imagens dos combos no formulário e na listagem.

### 4. Edição de usuários
A tela de Usuários agora possui botão **Editar**. É possível alterar:
- nome;
- e-mail;
- função/papel;
- senha, opcionalmente.

A senha não é alterada quando o campo de nova senha fica em branco.

### 5. Atualização de status dos pedidos
O Dashboard possuía um tratamento de erro genérico que ocultava a mensagem real retornada pela API. Agora:
- a mensagem retornada pelo backend é exibida;
- erros de regra de negócio não são convertidos em "Tente novamente";
- pedidos agendados ficam bloqueados até o horário previsto;
- a resposta `PEDIDO_AGENDADO` é identificada;
- pagamento Pix Mercado Pago pendente recebe mensagem específica;
- após uma atualização válida, os pedidos são recarregados do banco em vez de manter estado otimista.

O backend também passou a retornar códigos estruturados para essas regras (`PEDIDO_AGENDADO` e `PAGAMENTO_PENDENTE`).

## Validação
- Sintaxe de todos os arquivos JavaScript do backend: PASS.
- Build do frontend: não executado neste ambiente por ausência das dependências instaladas (`vite`).
- Nenhuma migration nova é necessária para esta versão.
