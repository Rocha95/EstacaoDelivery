# Alterações do Painel — V5

## Adicionais
- Adicionado botão **Editar** na tela de Adicionais.
- Edição de nome, preço, grupo e foto.
- Upload de nova foto via multipart.
- Mantido o combo de grupos cadastrados no banco.

## Combos
- Adicionado campo **Foto do combo** com upload ou URL.
- Fotos são armazenadas em `painel/backend/uploads/combos`.
- Adicionada coluna `imagemUrl` em `combos`.
- Cliente recebe a URL pública da imagem do combo pelo catálogo.
- Corrigida a chamada do toggle de combo para `/api/combos/:id/ativo`.
- Cadastro de combo resolve os nomes digitados para IDs reais de produtos, aceitando também `2x Nome do Produto`.

## Banco
Migration: `20260920130000_combo_imagem_url`.

Após atualizar o projeto, executar:

```bash
npm install
npm run db:migrate
```

Não executar seed em banco com dados reais.
