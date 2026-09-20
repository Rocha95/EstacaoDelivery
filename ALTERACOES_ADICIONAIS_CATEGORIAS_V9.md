# Estacao Delivery — V9

## Regra nova para adicionais

Os adicionais agora utilizam **exatamente as mesmas categorias dos produtos**. Não existe mais um grupo específico de adicionais controlando quais opções aparecem para cada produto.

### Regra de negócio

Se:

- Produto `Cheese Bacon` pertence à categoria `Lanches`
- Adicional `Cheddar` pertence à categoria `Lanches`

então o Cliente verá `Cheddar` automaticamente ao abrir `Cheese Bacon`.

O vínculo agora é:

`Produto.categoriaId = OpcaoAdicional.categoriaId`

### Painel

A tela de Adicionais agora:

- carrega categorias de `/api/categorias`;
- usa o mesmo cadastro de categorias da tela de Produtos;
- não apresenta mais o combo de "Grupo de adicionais";
- exige uma categoria para novos adicionais;
- permite alterar a categoria na edição;
- continua permitindo foto, preço, ativação/inativação e edição.

### Banco

Foi adicionada a coluna opcional `categoriaId` em `opcoes_adicionais` e a relação com `categorias`.

O `grupoId` antigo foi tornado opcional para preservar dados legados sem mantê-lo como regra do cardápio.

A migration também tenta migrar automaticamente adicionais antigos para a primeira categoria encontrada entre os produtos que utilizavam o grupo legado.

### Cliente

O catálogo passou a carregar as opções ativas diretamente de `Categoria.opcoes` e expõe uma estrutura compatível com a tela atual de detalhe do produto.

Não é mais necessário associar manualmente um produto a um grupo de adicionais.

### Segurança no pedido

Ao criar o pedido, o backend consulta novamente a categoria atual do produto e somente aceita adicionais pertencentes à mesma categoria. Portanto, alterar o payload do navegador não permite selecionar um adicional de outra categoria.

### Dados legados

As tabelas `grupos_adicionais` e `produto_grupo_adicional` foram preservadas nesta versão para evitar remoção destrutiva de dados antigos. Elas não controlam mais o cardápio do Cliente.

Adicionais antigos que permanecerem sem `categoriaId` aparecem no Painel como "Adicionais sem categoria" e devem ser editados para receber uma categoria.
