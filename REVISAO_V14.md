# Estação Delivery — V14

## Cliente
- Corrigida a normalização de imagens antigas gravadas como `http://localhost:3333/uploads/...`.
- O navegador passa a carregar `/uploads/...` sempre pelo backend do Cliente (`3334`).
- Backend Cliente serve diretamente a pasta `painel/backend/uploads` no monorepo.
- Adicionado `/health` para diagnosticar o diretório de uploads.
- Backend imprime no startup a URL pública de imagens.
- Cadastro novo de imagens pelo Painel passa a persistir caminho relativo (`/uploads/...`) para evitar acoplamento à porta 3333.
- Corrigida compatibilidade do controller de produtos do Painel com `Categoria.adicionais`.

## Autenticação
- Rotas privadas do Cliente agora exigem usuário + token antes de renderizar.
- Token ausente/expirado limpa a sessão e redireciona para Login.
- Erros 401 carregam `status` no erro da API para tratamento correto no frontend.
- Checkout não tenta carregar `/api/enderecos` sem autenticação.

## Distância / rota
- Endereço estruturado do estabelecimento é usado para geocodificação.
- A chave de cache considera todos os campos do endereço.
- Coordenadas antigas do estabelecimento não são usadas silenciosamente após mudança de endereço.
- `REVALIDAR_COORDENADAS_ESTABELECIMENTO=true` força nova geocodificação para garantir origem atualizada.
- `ALLOW_STALE_ESTABLISHMENT_COORDS=false` evita cobrar frete usando coordenadas potencialmente antigas quando o serviço de geocodificação falhar.
- OSRM continua sendo a fonte da distância rodoviária e Haversine permanece desativado como fallback.

## Observação sobre o erro 504
`504 (Outdated Request)` do Vite é normalmente uma requisição antiga do HMR após reiniciar/alterar módulos. Depois de instalar a V14, pare o Vite, remova `cliente/frontend/node_modules/.vite` se existir, reinicie e faça um hard refresh no navegador.
