# Estação Delivery — V13

## Correções desta versão

### Cliente — imagens
- Corrigido o caminho padrão do diretório compartilhado de uploads.
- O backend do Cliente agora serve `/uploads` diretamente da pasta `painel/backend/uploads` quando executado no monorepo.
- `UPLOADS_DIR` continua disponível para produção/storage compartilhado.
- Produtos, adicionais e combos usam caminhos relativos `/uploads/...`, resolvidos pelo frontend contra o backend do Cliente (3334).

### Cliente — endereço e distância
- O estabelecimento passa a ser geocodificado usando os campos estruturados de endereço.
- O cálculo de rota usa as coordenadas do endereço estruturado do estabelecimento.
- O endereço do cliente continua sendo geocodificado a partir dos campos estruturados.
- Sem fallback silencioso para Haversine quando `ROUTING_FALLBACK_HAVERSINE=false`.

### Painel — endereço do estabelecimento
O endereço agora é armazenado em campos separados:
- Rua
- Número
- Bairro
- Cidade
- Estado/UF
- CEP

O campo `endereco` continua no banco como representação textual/canônica para compatibilidade.

O botão Salvar da tela Configurações monta automaticamente o endereço completo e solicita novas coordenadas ao serviço de geocodificação.

A tela Taxas de Entrega não edita mais o endereço: ela exibe a origem configurada e mantém uma única fonte de verdade em Configurações.

## Migration

Foi adicionada:

`packages/database/prisma/migrations/20260920170000_endereco_estabelecimento_estruturado/migration.sql`

Depois de atualizar o projeto:

```bash
npm install
npm run db:migrate
npm run prisma:generate --workspace packages/database
```

Não execute `npm run db:seed` em banco com dados reais.

## Variáveis do Cliente

```env
PORT=3334
PAINEL_PUBLIC_URL=http://localhost:3333
UPLOADS_DIR=C:/caminho/EstacaoDelivery/painel/backend/uploads
ROUTING_URL=https://router.project-osrm.org
ROUTING_FALLBACK_HAVERSINE=false
REVALIDAR_COORDENADAS_ENDERECO=true
```

No monorepo, `UPLOADS_DIR` pode ser omitido: o backend tenta detectar automaticamente `painel/backend/uploads`.
