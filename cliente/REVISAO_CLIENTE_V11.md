# Revisão do módulo Cliente — V11

## Correções principais

1. Corrigido `PrismaClientValidationError` no catálogo:
   - `Categoria.opcoes` não existe no schema atual.
   - O relacionamento correto é `Categoria.adicionais`.
   - Corrigidas todas as consultas do catálogo e validação de pedidos.

2. Corrigido bug no `obterProduto`:
   - havia referência a `p.categoria` fora do escopo.
   - agora utiliza `produto.categoria`.

3. Fotos dos produtos:
   - continuam sendo convertidas para URL pública do backend do Painel.

4. Fotos dos adicionais:
   - adicionais retornados pelo catálogo agora também têm `imagemUrl` convertido para a URL pública do Painel.
   - ProductDetail passou a exibir a foto do adicional.

5. Combos:
   - endpoint público devolve imagem do combo.
   - imagens dos produtos dentro do combo também são normalizadas.
   - Home passa a exibir uma seção de Combos.
   - combo pode ser adicionado ao carrinho.
   - checkout envia `comboId` corretamente.
   - carrinho exibe a imagem do item quando disponível.

6. Resiliência:
   - falha no endpoint de combos não impede o carregamento do catálogo de produtos.

## Variáveis

No `cliente/backend/.env`:

`PAINEL_PUBLIC_URL=http://localhost:3333`

Em produção, deve apontar para a URL pública do backend do Painel que serve `/uploads/...`.

## Observação

Não foi criada migration nesta V11. A implementação utiliza a relação `Categoria.adicionais` já presente no schema utilizado pelo Prisma Client do projeto.
