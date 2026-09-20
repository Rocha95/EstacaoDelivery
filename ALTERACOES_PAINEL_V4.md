# Estação Delivery — Correções do Painel do Estabelecimento — V4

## 1. Status dos pedidos
- Corrigida a máquina de estados para usar os mesmos valores do Prisma no frontend e backend:
  - RECEBIDO → EM_PRODUCAO
  - EM_PRODUCAO → SAIU_PARA_ENTREGA
  - SAIU_PARA_ENTREGA → FINALIZADO
- Dashboard e tela de Pedidos agora trabalham com os valores reais armazenados no banco.
- Backend passou a aceitar explicitamente o status solicitado e validar se a transição é a próxima etapa permitida.
- Mantidos aliases PRODUCAO e ENTREGA para compatibilidade com chamadas antigas.
- A validação também é aplicada ao avanço para Saiu para Entrega e Finalizado.
- Pedidos agendados continuam bloqueados até o horário programado.

## 2. Endereço de origem / taxas de entrega
- Corrigidos os endpoints que a tela Taxas de Entrega utilizava e que não existiam no backend.
- GET /api/taxas-entrega agora retorna endereço, raio máximo e faixas cadastradas.
- PUT /api/taxas-entrega agora salva endereço, raio máximo e valores das faixas.
- O endereço é persistido na tabela configuracoes.
- Ao salvar/alterar o endereço pela tela de taxas, o backend geocodifica novamente o endereço e atualiza latitude/longitude.
- Removido o endereço fixo de Votorantim do frontend.
- O endereço do estabelecimento passa a ser efetivamente variável por configuração/banco.

## 3. Cadastro de adicionais com foto
- Corrigido o suporte de persistência para imagem de adicionais.
- Adicionada migration:
  `20260920120000_adicional_imagem_url`
- A migration adiciona `imagemUrl` em `opcoes_adicionais` com IF NOT EXISTS.
- O upload continua usando multer e salvando em `uploads/adicionais`.
- O erro genérico causado pela ausência da coluna no banco deixa de ocorrer após aplicar a migration.

## 4. Grupo do adicional
- Substituído o campo livre de grupo por um combo.
- O combo é carregado diretamente de `GET /api/adicionais/grupos`.
- O cadastro envia `grupoId` ao backend.
- O backend valida que o grupo informado existe.
- Mantido suporte ao formato antigo baseado em nome para compatibilidade.

## 5. Compatibilidade e segurança
- O backend continua sendo a fonte de verdade para transições de status.
- Valores inválidos de transição retornam HTTP 409 com mensagem explicativa.
- Não foram alterados os fluxos do Cliente nesta rodada.

## Migration obrigatória
Após substituir o projeto, executar na raiz:

```bash
npm install
npm run db:migrate
npm run db:seed
```

Use `db:seed` somente se quiser recriar os dados de demonstração; ele limpa e popula as tabelas do projeto.

Para uma base que já contém dados reais, execute apenas a migration e não rode o seed sem backup.
