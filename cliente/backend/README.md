# Backend do Cliente

API do app do cliente, usando o mesmo PostgreSQL/Prisma do Painel.

- Porta padrão: `3334`
- Base: `/api`
- JWT para autenticação
- Catálogo/configuração públicos
- Endereços e pedidos protegidos por JWT
- Preços, adicionais, cupons, frete e total dos pedidos são validados no servidor

## Ambiente

Copie `.env.example` para `.env` e configure `DATABASE_URL`, `JWT_SECRET` e `CORS_ORIGIN`.

## Executar

```bash
npm run dev --workspace cliente/backend
```


### Imagens e cálculo automático de entrega

- `PAINEL_PUBLIC_URL` deve apontar para a URL pública do backend do Painel. As imagens cadastradas pelo estabelecimento são armazenadas pelo Painel em `/uploads/produtos/...` e o catálogo do Cliente devolve a URL pública completa.
- O cliente não informa mais a distância do endereço. Ao cadastrar um endereço, a API geocodifica rua/número/bairro/cidade/estado/CEP e salva latitude/longitude.
- A taxa é calculada por `GET /api/taxas-entrega/calcular?enderecoId=...`, autenticado. A API compara as coordenadas do endereço com as coordenadas do estabelecimento usando distância geodésica (Haversine).
- Se as coordenadas do estabelecimento ainda não estiverem cadastradas, a API geocodifica `Configuracao.endereco` automaticamente e salva as coordenadas.
- `distanciaKm` permanece no banco somente como cache do cálculo; nunca é aceito como valor enviado pelo cliente. O backend recalcula a distância novamente na criação do pedido.

O geocodificador padrão é o Nominatim/OpenStreetMap. Configure um `GEOCODING_USER_AGENT` identificando a aplicação e, para produção em maior escala, considere um provedor de geocodificação dedicado.
