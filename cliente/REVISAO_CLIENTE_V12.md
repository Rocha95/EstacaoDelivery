# Revisão Cliente V12

## Imagens
- O backend Cliente agora serve `/uploads/*` diretamente da pasta de uploads do Painel no monorepo.
- O catálogo retorna caminhos relativos (`/uploads/...`) para evitar dependência do backend Painel na porta 3333.
- Em produção, configure `UPLOADS_DIR` para um storage compartilhado.

## Distância
- A origem do estabelecimento é regeocodificada a partir do endereço salvo para evitar coordenadas antigas.
- O resultado é cacheado por 5 minutos.
- `REVALIDAR_COORDENADAS_ENDERECO=true` permite revalidar também o endereço do cliente.
- `ROUTING_FALLBACK_HAVERSINE=false` evita que uma falha do serviço de rotas seja silenciosamente tratada como distância em linha reta.
- A distância usada no frete continua sendo a rota rodoviária do OSRM.
