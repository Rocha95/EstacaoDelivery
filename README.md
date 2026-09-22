# 🍔 Estação Delivery

> Plataforma completa de delivery desenvolvida em arquitetura monorepo, com aplicações independentes para **clientes** e **estabelecimentos**, compartilhando a mesma infraestrutura de dados.

O **Estação Delivery** foi desenvolvido para atender toda a jornada de um pedido de delivery: desde a apresentação do catálogo e criação do pedido pelo cliente até a operação do estabelecimento, cozinha, pagamento, estoque, entrega, fidelidade e avaliação.

O projeto utiliza **React + Node.js + Express + PostgreSQL + Prisma** e foi estruturado para suportar múltiplos estabelecimentos (multi-tenant), integrações de pagamento via PIX, WhatsApp e uma rotina de QA voltada para regressão e confiabilidade.

---

## 📌 Visão geral

O projeto é dividido em **dois aplicativos principais**, cada um com seu próprio frontend e backend:

### 👤 Aplicativo do Cliente

Interface utilizada pelo consumidor final para:

- visualizar o estabelecimento;
- navegar pelo catálogo;
- consultar categorias;
- visualizar produtos, adicionais e combos;
- montar o carrinho;
- cadastrar e selecionar endereços;
- escolher Delivery ou Retirada;
- calcular taxas de entrega;
- utilizar cupons;
- escolher forma de pagamento;
- realizar pagamentos via PIX;
- acompanhar pedidos em tempo real;
- consultar histórico;
- acompanhar pontos de fidelidade;
- avaliar pedidos finalizados.

### 🏪 Aplicativo do Estabelecimento

Painel administrativo e operacional utilizado pela equipe para:

- acompanhar pedidos;
- controlar o fluxo operacional;
- utilizar o KDS/Cozinha;
- cadastrar produtos;
- cadastrar categorias;
- administrar adicionais;
- criar combos;
- controlar estoque;
- configurar horários;
- criar cupons;
- configurar taxas de entrega;
- administrar clientes;
- acompanhar avaliações;
- responder avaliações;
- configurar PIX;
- acompanhar pagamentos;
- configurar fidelidade;
- configurar WhatsApp;
- administrar usuários;
- administrar estabelecimentos;
- consultar relatórios.

---

# ✨ Principais funcionalidades

## 👤 Cliente

### 🔐 Cadastro e autenticação

O cliente pode:

- criar uma conta;
- realizar login;
- manter uma sessão autenticada através de JWT;
- acessar seu perfil;
- consultar seus próprios dados.

As informações protegidas, como endereços e pedidos, são vinculadas ao usuário autenticado.

---

## 🍔 Catálogo

O cliente pode navegar pelo catálogo do estabelecimento e consultar:

- categorias;
- produtos;
- descrições;
- preços;
- imagens;
- adicionais;
- combos;
- disponibilidade.

O backend valida novamente as informações recebidas pelo frontend antes de criar o pedido.

Isso impede que o cliente altere manualmente valores ou IDs no navegador para tentar realizar uma compra inválida.

---

## 🛒 Carrinho

O carrinho permite:

- adicionar produtos;
- selecionar adicionais;
- adicionar combos;
- alterar quantidades;
- remover itens;
- visualizar subtotal;
- visualizar desconto;
- visualizar taxa de entrega;
- visualizar total.

O preço final é recalculado no servidor antes da criação do pedido.

---

## 📍 Endereços e entrega

O cliente pode cadastrar e administrar seus endereços.

O sistema contempla:

- endereço de entrega;
- cálculo de distância;
- cálculo de taxa;
- raio máximo de atendimento;
- Delivery;
- Retirada no estabelecimento.

O endereço utilizado no pedido pertence ao cliente autenticado e não pode ser substituído por um endereço de outro usuário.

> **Observação:** o projeto utiliza informações de distância para o cálculo da entrega. Em uma operação real, recomenda-se configurar corretamente geocodificação e roteamento.

---

# 💳 Pagamentos

O Estação Delivery possui suporte a dois cenários de PIX.

## PIX manual

O estabelecimento cadastra sua **Chave Pix** no Painel.

O cliente recebe:

- valor do pedido;
- QR Code;
- Pix Copia e Cola;
- instruções de pagamento.

Nesse modelo, a confirmação do recebimento é realizada pelo estabelecimento.

---

## PIX online via Mercado Pago

Quando configurado, o backend pode utilizar o Mercado Pago para gerar o pagamento PIX.

Variáveis principais:

```env
PAYMENT_PROVIDER=mercadopago
MP_ACCESS_TOKEN=APP_USR-...
MP_WEBHOOK_URL=https://seu-dominio.com/api/pagamentos/webhook
```

O token de acesso deve permanecer exclusivamente no backend.

---

# ⏱️ Status "Aguardando pagamento"

Pedidos PIX possuem um fluxo específico de pagamento.

```text
Cliente escolhe PIX
        ↓
Pedido criado
        ↓
AGUARDANDO_PAGAMENTO
        ↓
Pagamento aprovado
        ↓
RECEBIDO
        ↓
EM_PRODUCAO
        ↓
SAIU_PARA_ENTREGA
        ↓
FINALIZADO
```

Caso o pagamento não seja realizado dentro do prazo:

```text
AGUARDANDO_PAGAMENTO
        ↓
10 minutos
        ↓
CANCELADO
```

Quando ocorre a expiração:

- pagamento é marcado como `EXPIRADO`;
- pedido é cancelado;
- estoque reservado pelo pedido é estornado;
- o pedido não entra na cozinha.

O pagamento aprovado depois de um pedido já cancelado não reabre automaticamente o pedido.

---

# 📦 Estoque

O sistema possui controle de estoque opcional por produto.

É possível controlar:

- estoque atual;
- estoque mínimo;
- entradas;
- saídas;
- ajustes;
- vendas;
- estornos.

Quando um produto controlado chega a zero, o cliente pode visualizá-lo como **Esgotado** e não consegue realizar uma compra inválida.

O sistema também contempla estoque de componentes de combos.

### Movimentações

```text
ENTRADA
SAIDA
AJUSTE
VENDA
ESTORNO
```

Em cancelamentos e expirações de PIX, o estoque relacionado ao pedido pode ser restaurado através de movimentações de estorno.

---

# 👨‍🍳 KDS / Cozinha

O Painel possui uma área de cozinha para acompanhar a produção.

Fluxo principal:

```text
RECEBIDO
    ↓
EM_PRODUCAO
    ↓
SAIU_PARA_ENTREGA
    ↓
FINALIZADO
```

Pedidos:

- aguardando pagamento;
- com pagamento não aprovado;
- ou agendados para um horário futuro

não devem entrar em produção antes de serem liberados.

---

# 📅 Pedidos agendados

O cliente pode realizar pedidos para um horário futuro, quando essa funcionalidade estiver disponível para a operação.

O estabelecimento não pode iniciar a produção antes do horário permitido.

Exemplo:

```text
Pedido:
22/09/2026 às 20:00

Antes das 20:00
→ Aguardando horário

A partir das 20:00
→ Pode entrar em produção
```

Essa regra é validada no backend e também refletida na interface do Painel.

---

# 🎟️ Cupons

O estabelecimento pode criar cupons de desconto com regras como:

- código;
- desconto percentual;
- desconto em valor;
- pedido mínimo;
- validade.

Os cupons são vinculados ao estabelecimento correto.

---

# ⭐ Fidelidade

O sistema possui um módulo de fidelidade.

É possível configurar a quantidade de pontos atribuída por valor gasto.

Os pontos são relacionados ao estabelecimento e ao cliente.

O cliente pode:

- consultar saldo;
- consultar pontos acumulados;
- consultar histórico de movimentações.

Os pontos são processados a partir de pedidos finalizados.

---

# ⭐ Avaliações

Depois de um pedido finalizado, o cliente pode registrar:

- nota de 1 a 5;
- comentário.

O estabelecimento pode consultar as avaliações e responder aos clientes pelo Painel.

O sistema impede avaliações indevidas, como:

- pedido não finalizado;
- pedido pertencente a outro cliente;
- segunda avaliação para o mesmo pedido.

---

# 📱 WhatsApp

O projeto possui suporte opcional para integração com **Evolution API**.

A integração pode ser utilizada para notificações relacionadas ao pedido.

Exemplos:

- pedido recebido;
- pedido em produção;
- pedido saiu para entrega;
- pedido finalizado;
- pedido cancelado.

A integração é opcional. Se estiver desativada ou indisponível, a operação principal do pedido não deve depender do WhatsApp.

Configuração:

```env
WHATSAPP_ENABLED=false

EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_INSTANCE=estacao
EVOLUTION_API_KEY=...
```

---

# 🏪 Multi-estabelecimento

O sistema possui arquitetura preparada para múltiplos estabelecimentos.

Cada estabelecimento possui seu próprio contexto de dados.

O tenant pode ser identificado por:

```text
X-Estabelecimento-Id
```

ou pela configuração de ambiente:

```env
ESTABELECIMENTO_ID=default
```

O sistema aplica o contexto do estabelecimento às principais entidades, como:

- produtos;
- categorias;
- adicionais;
- combos;
- horários;
- cupons;
- taxas;
- configurações;
- pedidos;
- usuários;
- fidelidade.

Isso permite evoluir o projeto para uma operação SaaS com diversas lojas.

---

# 🧱 Arquitetura

O projeto utiliza uma estrutura de **monorepo com npm workspaces**.

```text
EstacaoDelivery/
│
├── cliente/
│   ├── frontend/
│   │   └── Aplicação React do cliente
│   │
│   └── backend/
│       └── API Node.js / Express do cliente
│
├── painel/
│   ├── frontend/
│   │   └── Aplicação React do estabelecimento
│   │
│   └── backend/
│       └── API Node.js / Express do painel
│
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.js
│   │   └── src/
│   │
│   └── shared-ui/
│       └── tokens.css
│
├── qa/
│   ├── api/
│   ├── e2e/
│   ├── config/
│   └── docs/
│
├── package.json
└── README.md
```

---

# 🛠️ Tecnologias

## Frontend

- React 18
- React Router
- Vite
- CSS

## Backend

- Node.js
- Express
- JWT
- bcryptjs
- CORS
- Multer
- QRCode

## Banco de dados

- PostgreSQL
- Prisma ORM

## Integrações

- Mercado Pago
- Evolution API / WhatsApp
- OSRM para roteamento/geodistância

## Qualidade

- testes estáticos;
- testes de API;
- smoke tests;
- matriz de regressão;
- testes de segurança;
- testes E2E planejados;
- testes de concorrência;
- documentação de bugs;
- checklist de release.

---

# 🚀 Como executar o projeto

## Pré-requisitos

Antes de executar o projeto, tenha instalado:

- Node.js;
- npm;
- PostgreSQL;
- Git.

Recomenda-se utilizar uma versão LTS atual do Node.js.

---

# 1. Clonar o projeto

```bash
git clone https://github.com/SEU-USUARIO/EstacaoDelivery.git
```

Entrar na pasta:

```bash
cd EstacaoDelivery
```

---

# 2. Instalar dependências

Na raiz do projeto:

```bash
npm install
```

Como o projeto utiliza npm workspaces, a instalação deve ser realizada preferencialmente na raiz.

---

# 3. Configurar PostgreSQL

Crie um banco PostgreSQL para o projeto.

Exemplo:

```text
Banco: sistema_delivery
Usuário: postgres
Senha: postgres
Host: localhost
Porta: 5432
```

A URL será semelhante a:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sistema_delivery
```

> Utilize uma senha adequada para ambientes reais.

---

# 4. Configurar variáveis de ambiente

## Backend do Cliente

Copie:

```text
cliente/backend/.env.example
```

para:

```text
cliente/backend/.env
```

Configuração básica:

```env
PORT=3334
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sistema_delivery
JWT_SECRET=troque-por-um-segredo-forte
CORS_ORIGIN=http://localhost:5174
ESTABELECIMENTO_ID=default
```

---

## Backend do Painel

Copie:

```text
painel/backend/.env.example
```

para:

```text
painel/backend/.env
```

Configuração básica:

```env
PORT=3333
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sistema_delivery
ESTABELECIMENTO_ID=default
CORS_ORIGIN=http://localhost:5173
```

---

## Frontend do Cliente

Copie:

```text
cliente/frontend/.env.example
```

para:

```text
cliente/frontend/.env
```

Configuração:

```env
VITE_API_URL=http://localhost:3334
VITE_ESTABELECIMENTO_ID=default
```

---

# 5. Configurar Prisma

Gerar o Prisma Client:

```bash
npm run prisma:generate --workspace packages/database
```

Executar as migrations:

```bash
npm run db:migrate
```

---

## Seed

O projeto possui seed para ambiente de desenvolvimento.

Para executar:

```bash
npm run db:seed
```

### ⚠️ Atenção

**Não execute o seed em um banco de produção que já contenha dados reais.**

O seed é destinado principalmente a ambientes de desenvolvimento e testes.

---

# 6. Executar os backends

Abra terminais separados.

### Backend do Cliente

```bash
npm run dev:cliente:backend
```

API:

```text
http://localhost:3334
```

API base:

```text
http://localhost:3334/api
```

---

### Backend do Painel

```bash
npm run dev:painel:backend
```

API:

```text
http://localhost:3333
```

API base:

```text
http://localhost:3333/api
```

---

# 7. Executar os frontends

### Cliente

```bash
npm run dev:cliente:frontend
```

Acesse:

```text
http://localhost:5174
```

### Painel

```bash
npm run dev:painel:frontend
```

Acesse:

```text
http://localhost:5173
```

---

# 🌐 Portas utilizadas

| Aplicação | Porta | URL |
|---|---:|---|
| Cliente Frontend | 5174 | `http://localhost:5174` |
| Cliente Backend | 3334 | `http://localhost:3334` |
| Painel Frontend | 5173 | `http://localhost:5173` |
| Painel Backend | 3333 | `http://localhost:3333` |
| PostgreSQL | 5432 | banco local |

---

# 🔄 Fluxo completo da aplicação

## Jornada do cliente

```text
Acessar estabelecimento
        ↓
Visualizar catálogo
        ↓
Escolher produto
        ↓
Selecionar adicionais
        ↓
Adicionar ao carrinho
        ↓
Informar endereço
        ↓
Escolher Delivery / Retirada
        ↓
Aplicar cupom
        ↓
Escolher pagamento
        ↓
Confirmar pedido
        ↓
Pagamento
        ↓
Acompanhar pedido
        ↓
Receber pedido
        ↓
Avaliar
        ↓
Acumular pontos
```

---

## Jornada do estabelecimento

```text
Login / acesso ao Painel
        ↓
Dashboard
        ↓
Receber pedido
        ↓
Validar pagamento
        ↓
KDS / Cozinha
        ↓
Produção
        ↓
Saída para entrega
        ↓
Finalização
        ↓
Fidelidade
        ↓
Avaliação
        ↓
Relatórios
```

---

# 📊 Fluxo de status dos pedidos

Os principais estados do pedido são:

```text
AGUARDANDO_PAGAMENTO
        ↓
RECEBIDO
        ↓
EM_PRODUCAO
        ↓
SAIU_PARA_ENTREGA
        ↓
FINALIZADO
```

Cancelamentos podem levar o pedido para:

```text
CANCELADO
```

No caso de PIX:

```text
AGUARDANDO_PAGAMENTO
        ↓
10 minutos sem pagamento
        ↓
CANCELADO
```

---

# 🗄️ Banco de dados

O schema está localizado em:

```text
packages/database/prisma/schema.prisma
```

As migrations ficam em:

```text
packages/database/prisma/migrations/
```

Para abrir o Prisma Studio:

```bash
npm run db:studio
```

---

# 🧪 QA e testes

O projeto possui uma estrutura dedicada de QA:

```text
qa/
├── api/
├── e2e/
├── config/
└── docs/
```

A estratégia segue uma abordagem em camadas:

1. Smoke tests
2. Static checks
3. Testes de API
4. Testes de integração
5. Testes E2E
6. Testes de regressão
7. Testes de segurança
8. Testes de concorrência
9. Testes de performance
10. Homologação

---

## Teste estático

```bash
npm run qa:static
```

Verifica principalmente:

- sintaxe JavaScript;
- arquivos obrigatórios;
- configurações;
- inconsistências conhecidas.

---

## Smoke / API

```bash
npm run qa:smoke
```

ou:

```bash
npm run qa:api
```

Para testes que alteram dados:

```bash
ALLOW_MUTATION=true npm run qa:api
```

> ⚠️ Nunca execute testes mutáveis contra produção.

---

# 🧪 Cenários importantes de regressão

O projeto possui casos específicos para:

### Autenticação

- cadastro;
- login;
- senha inválida;
- JWT inválido;
- JWT expirado.

### Catálogo

- produto ativo;
- produto inativo;
- estoque zero;
- combo;
- adicionais;
- produtos de outro estabelecimento.

### Pedidos

- Delivery;
- Retirada;
- pedido mínimo;
- cupom;
- agendamento;
- pagamento;
- cancelamento;
- histórico.

### PIX

- PIX manual;
- PIX Mercado Pago;
- QR Code;
- Pix Copia e Cola;
- confirmação;
- expiração;
- cancelamento após 10 minutos;
- estorno de estoque;
- webhook;
- pagamento aprovado após cancelamento.

### Estoque

- entrada;
- saída;
- venda;
- estorno;
- estoque insuficiente;
- concorrência;
- combos.

### Segurança

- autenticação;
- autorização;
- IDOR;
- isolamento de tenant;
- exposição de segredos;
- XSS;
- validação de entrada.

---

# 🔐 Segurança

Alguns princípios utilizados no projeto:

- JWT para autenticação do cliente;
- senhas armazenadas com hash;
- validação no backend;
- isolamento por estabelecimento;
- proteção de recursos pertencentes a outros usuários;
- tokens de integração mantidos no backend;
- CORS configurável;
- validação de regras de negócio no servidor;
- não confiar nos valores calculados pelo frontend.

### Nunca versione:

```text
.env
.env.local
tokens
senhas
Access Tokens
API Keys
credenciais de banco
```

Os arquivos `.env.example` devem conter somente valores de exemplo.

---

# 🏪 Multi-tenant

O projeto foi estruturado para permitir que uma mesma instalação atenda diferentes estabelecimentos.

Exemplo:

```text
Estabelecimento A
 ├── Produtos
 ├── Pedidos
 ├── Clientes
 ├── Cupons
 └── Configurações

Estabelecimento B
 ├── Produtos
 ├── Pedidos
 ├── Clientes
 ├── Cupons
 └── Configurações
```

Os dados devem permanecer isolados pelo contexto do estabelecimento.

---

# 🖼️ Uploads e imagens

O Painel possui suporte para imagens de:

- produtos;
- adicionais;
- combos.

Os arquivos são processados pelo backend através de upload e disponibilizados para os frontends.

Em produção, recomenda-se avaliar armazenamento de arquivos em serviço dedicado, como object storage/CDN, em vez de depender exclusivamente do filesystem local do servidor.

---

# 📱 Responsividade

O projeto foi pensado para diferentes tamanhos de tela.

Os principais cenários de QA incluem:

```text
360 × 800
390 × 844
768 × 1024
1366 × 768
1920 × 1080
```

---

# 🧩 Variáveis de ambiente

## Cliente Backend

```env
PORT=3334
DATABASE_URL=
JWT_SECRET=
CORS_ORIGIN=
ESTABELECIMENTO_ID=

ROUTING_URL=
ROUTING_FALLBACK_HAVERSINE=
REVALIDAR_COORDENADAS_ENDERECO=
REVALIDAR_COORDENADAS_ESTABELECIMENTO=
ALLOW_STALE_ESTABLISHMENT_COORDS=

PAYMENT_PROVIDER=
MP_ACCESS_TOKEN=
MP_WEBHOOK_URL=

WHATSAPP_ENABLED=
EVOLUTION_API_URL=
EVOLUTION_INSTANCE=
EVOLUTION_API_KEY=
```

## Painel Backend

```env
PORT=3333
DATABASE_URL=
ESTABELECIMENTO_ID=
CORS_ORIGIN=
GEOCODING_USER_AGENT=

WHATSAPP_ENABLED=
EVOLUTION_API_URL=
EVOLUTION_INSTANCE=
EVOLUTION_API_KEY=
```

## Cliente Frontend

```env
VITE_API_URL=
VITE_ESTABELECIMENTO_ID=
```

---

# 🧰 Scripts disponíveis

Na raiz do projeto:

| Comando | Função |
|---|---|
| `npm install` | Instala dependências |
| `npm run dev:painel:frontend` | Executa frontend do Painel |
| `npm run dev:painel:backend` | Executa backend do Painel |
| `npm run dev:cliente:frontend` | Executa frontend do Cliente |
| `npm run dev:cliente:backend` | Executa backend do Cliente |
| `npm run prisma:generate --workspace packages/database` | Gera Prisma Client |
| `npm run db:migrate` | Executa migrations |
| `npm run db:seed` | Executa seed |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run qa:static` | QA estático |
| `npm run qa:api` | Testes de API |
| `npm run qa:smoke` | Smoke tests |

---

# 🧑‍💻 Desenvolvimento

## Recomendação de fluxo

Antes de desenvolver:

```bash
git pull
npm install
```

Depois de alterações de banco:

```bash
npm run prisma:generate --workspace packages/database
npm run db:migrate
```

Antes de abrir um Pull Request:

```bash
npm run qa:static
npm run qa:api
```

E, quando aplicável, executar os testes E2E e a matriz de regressão.

---

# 🌿 Git e branches

Uma estratégia recomendada:

```text
main
 │
 ├── develop
 │
 ├── feature/pagamento-pix
 │
 ├── feature/fidelidade
 │
 ├── fix/pedido-agendado
 │
 └── fix/imagem-produto
```

### Convenção de commits

Recomenda-se utilizar Conventional Commits:

```text
feat: adiciona pagamento via pix
fix: corrige status de pedido agendado
refactor: reorganiza serviço de pedidos
test: adiciona testes de expiração do pix
docs: atualiza documentação
chore: atualiza dependências
```

---

# 🔀 Pull Requests

Antes de abrir um Pull Request:

- [ ] Código testado localmente
- [ ] QA estático executado
- [ ] Testes de API executados
- [ ] Testes E2E executados quando aplicável
- [ ] Migration documentada quando houver alteração de banco
- [ ] Variáveis `.env.example` atualizadas
- [ ] README/documentação atualizados quando necessário
- [ ] Nenhum segredo adicionado ao repositório
- [ ] Caso de regressão criado para bugs corrigidos

---

# 🐛 Relato de bugs

Ao encontrar um problema, registre:

1. Ambiente;
2. versão/release;
3. estabelecimento;
4. usuário;
5. tela;
6. data/hora;
7. número do pedido;
8. passos para reproduzir;
9. resultado esperado;
10. resultado obtido;
11. mensagem de erro;
12. screenshot ou vídeo;
13. logs, quando disponíveis.

Consulte:

```text
qa/docs/BUG_REPORT.md
```

---

# 📋 Documentação de QA

Documentos disponíveis:

```text
qa/docs/MATRIZ_TESTES.md
qa/docs/PLANO_REGRESSAO.md
qa/docs/BUG_REPORT.md
qa/docs/CHECKLIST_RELEASE.md
qa/docs/PIX_AGUARDANDO_PAGAMENTO.md
```

Eles devem ser utilizados como referência antes de releases importantes.

---

# 🚢 Checklist de Release

Antes de uma versão ser considerada pronta:

- [ ] Backend Cliente inicia sem erros
- [ ] Backend Painel inicia sem erros
- [ ] Banco está atualizado
- [ ] Prisma Client foi regenerado
- [ ] Frontend Cliente compila
- [ ] Frontend Painel compila
- [ ] Smoke tests passam
- [ ] Testes críticos P0/P1 passam
- [ ] Fluxo de cadastro/login validado
- [ ] Catálogo validado
- [ ] Checkout validado
- [ ] Delivery e Retirada validados
- [ ] PIX validado
- [ ] Expiração do PIX validada
- [ ] Estoque validado
- [ ] KDS validado
- [ ] Agendamento validado
- [ ] Fidelidade validada
- [ ] Avaliações validadas
- [ ] Multi-tenant validado
- [ ] Segurança validada
- [ ] Nenhum segredo versionado
- [ ] Documentação atualizada

---

# 📈 Próximos passos possíveis

A arquitetura atual permite evoluir o projeto para funcionalidades como:

- pagamentos com cartão online;
- integração com outros gateways;
- rastreamento de entrega;
- gestão de entregadores;
- notificações push;
- PWA;
- aplicação mobile;
- relatórios financeiros avançados;
- dashboard gerencial;
- cupons mais avançados;
- programas de fidelidade com níveis;
- integração com impressoras térmicas;
- integração com marketplaces;
- armazenamento de imagens em cloud;
- observabilidade e monitoramento;
- CI/CD;
- testes E2E automatizados em pipeline.

---

# 📚 Documentação complementar

Além deste README, consulte:

```text
REVISAO_V21.md
qa/README.md
qa/docs/MATRIZ_TESTES.md
qa/docs/PLANO_REGRESSAO.md
qa/docs/BUG_REPORT.md
qa/docs/CHECKLIST_RELEASE.md
qa/docs/PIX_AGUARDANDO_PAGAMENTO.md
```

---

# 🤝 Contribuição

Sugestão de fluxo para contribuição:

```text
Fork
  ↓
Branch
  ↓
Desenvolvimento
  ↓
Testes
  ↓
Pull Request
  ↓
Code Review
  ↓
Merge
```

Para alterações que envolvam banco de dados:

1. criar migration;
2. atualizar schema;
3. atualizar documentação;
4. validar dados existentes;
5. adicionar testes de regressão.

---

# 📄 Licença

Este projeto pode receber uma licença específica conforme a estratégia de distribuição definida para o repositório.

Caso o projeto seja publicado como open source, recomenda-se adicionar um arquivo `LICENSE` na raiz do repositório e definir explicitamente os termos de uso.

---

# 👨‍💻 Projeto

**Estação Delivery**

Sistema de delivery desenvolvido com foco em:

- experiência do cliente;
- eficiência operacional;
- arquitetura modular;
- segurança;
- escalabilidade;
- controle de estoque;
- pagamentos;
- fidelização;
- qualidade de software.

---

<p align="center">
  Desenvolvido com React, Node.js, Express, PostgreSQL e Prisma.
</p>
