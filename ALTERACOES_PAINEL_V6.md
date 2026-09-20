# Alterações do Painel — V6

## Combos
- Corrigido o fluxo de cadastro que podia permanecer indefinidamente em “Salvando...” quando um produto não era localizado.
- A conversão dos itens agora ocorre dentro de `try/catch/finally`, garantindo que o estado de envio sempre seja liberado.
- Mensagens de erro da API são exibidas ao operador.
- Criado modo de edição de combo no mesmo formulário.
- Botão **Editar** adicionado aos cards dos combos.
- Edição permite alterar nome, produtos/quantidades, preço e foto.
- Inclusão de foto por upload ou URL permanece disponível.
- Remoção de foto durante a edição é persistida como `imagemUrl = null`.
- Comparação de nomes de produtos ficou mais tolerante a maiúsculas/minúsculas e acentos.
- Backend mantém validação de nome, preço e itens do combo.
- Compatibilidade mantida com `PATCH /api/combos/:id` e `PATCH /api/combos/:id/ativo`.

## Observação
A V6 foi reconstruída a partir da V5 disponível na sessão, reaplicando as correções desta versão.
