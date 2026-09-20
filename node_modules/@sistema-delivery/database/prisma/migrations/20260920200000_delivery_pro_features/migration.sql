-- Estação Delivery V15: pagamentos, KDS, estoque, fidelidade, avaliações e multi-estabelecimento.
CREATE TABLE "estabelecimentos" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "estabelecimentos_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "estabelecimentos_slug_key" ON "estabelecimentos"("slug");

INSERT INTO "estabelecimentos" ("id", "slug", "nome")
SELECT 'default', 'default', COALESCE("nomeEstabelecimento", 'Meu Estabelecimento') FROM "configuracoes" WHERE "id" = 'default'
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "estabelecimentos" ("id", "slug", "nome") VALUES ('default','default','Meu Estabelecimento') ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "usuarios" ADD COLUMN "estabelecimentoId" TEXT;
UPDATE "usuarios" SET "estabelecimentoId" = 'default' WHERE "tipo" = 'EQUIPE';
ALTER TABLE "categorias" ADD COLUMN "estabelecimentoId" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "produtos" ADD COLUMN "estabelecimentoId" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "grupos_adicionais" ADD COLUMN "estabelecimentoId" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "opcoes_adicionais" ADD COLUMN "estabelecimentoId" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "combos" ADD COLUMN "estabelecimentoId" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "horarios_funcionamento" ADD COLUMN "estabelecimentoId" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "cupons" ADD COLUMN "estabelecimentoId" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "faixas_taxa_entrega" ADD COLUMN "estabelecimentoId" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "cupons" DROP CONSTRAINT IF EXISTS "cupons_codigo_key";
CREATE UNIQUE INDEX IF NOT EXISTS "cupons_estabelecimentoId_codigo_key" ON "cupons"("estabelecimentoId","codigo");

ALTER TABLE "configuracoes" ADD COLUMN "estabelecimentoId" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "pedidos" ADD COLUMN "estabelecimentoId" TEXT NOT NULL DEFAULT 'default';

ALTER TABLE "produtos" ADD COLUMN "controlaEstoque" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "produtos" ADD COLUMN "estoqueAtual" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "produtos" ADD COLUMN "estoqueMinimo" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "configuracoes" ADD COLUMN "pontosPorReal" DOUBLE PRECISION NOT NULL DEFAULT 1;
ALTER TABLE "configuracoes" ADD COLUMN "whatsappAtivo" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "horarios_funcionamento" DROP CONSTRAINT IF EXISTS "horarios_funcionamento_diaSemana_key";
CREATE UNIQUE INDEX IF NOT EXISTS "horarios_funcionamento_estabelecimentoId_diaSemana_key" ON "horarios_funcionamento"("estabelecimentoId","diaSemana");
CREATE UNIQUE INDEX IF NOT EXISTS "configuracoes_estabelecimentoId_key" ON "configuracoes"("estabelecimentoId");

DO $$ BEGIN CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE','APROVADO','REJEITADO','CANCELADO','EXPIRADO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "TipoMovimentoEstoque" AS ENUM ('ENTRADA','SAIDA','AJUSTE','VENDA','ESTORNO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "TipoMovimentoFidelidade" AS ENUM ('CREDITO','DEBITO','AJUSTE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "pedidos" ADD COLUMN "pagamentoStatus" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE';

CREATE TABLE "pagamentos" (
  "id" TEXT NOT NULL,
  "pedidoId" TEXT NOT NULL,
  "provedor" TEXT NOT NULL,
  "externoId" TEXT,
  "status" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
  "valor" DECIMAL(10,2) NOT NULL,
  "qrCode" TEXT,
  "qrCodeBase64" TEXT,
  "copiaECola" TEXT,
  "ticketUrl" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pagamentos_pedidoId_key" ON "pagamentos"("pedidoId");

CREATE TABLE "estoque_movimentos" (
  "id" TEXT NOT NULL,
  "produtoId" TEXT NOT NULL,
  "tipo" "TipoMovimentoEstoque" NOT NULL,
  "quantidade" INTEGER NOT NULL,
  "saldoAnterior" INTEGER NOT NULL,
  "saldoPosterior" INTEGER NOT NULL,
  "motivo" TEXT,
  "pedidoId" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "estoque_movimentos_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "estoque_movimentos_produtoId_criadoEm_idx" ON "estoque_movimentos"("produtoId","criadoEm");

CREATE TABLE "fidelidades" (
  "id" TEXT NOT NULL,
  "estabelecimentoId" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "pontosSaldo" INTEGER NOT NULL DEFAULT 0,
  "pontosAcumulados" INTEGER NOT NULL DEFAULT 0,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "fidelidades_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "fidelidades_usuarioId_estabelecimentoId_key" ON "fidelidades"("usuarioId","estabelecimentoId");

CREATE TABLE "movimentos_fidelidade" (
  "id" TEXT NOT NULL,
  "fidelidadeId" TEXT NOT NULL,
  "tipo" "TipoMovimentoFidelidade" NOT NULL,
  "pontos" INTEGER NOT NULL,
  "descricao" TEXT NOT NULL,
  "pedidoId" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "movimentos_fidelidade_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "movimentos_fidelidade_fidelidadeId_criadoEm_idx" ON "movimentos_fidelidade"("fidelidadeId","criadoEm");

CREATE TABLE "avaliacoes" (
  "id" TEXT NOT NULL,
  "pedidoId" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "nota" INTEGER NOT NULL,
  "comentario" TEXT,
  "resposta" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "avaliacoes_pedidoId_key" ON "avaliacoes"("pedidoId");
CREATE INDEX "avaliacoes_clienteId_criadoEm_idx" ON "avaliacoes"("clienteId","criadoEm");

ALTER TABLE "configuracoes" ADD CONSTRAINT "configuracoes_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "grupos_adicionais" ADD CONSTRAINT "grupos_adicionais_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "opcoes_adicionais" ADD CONSTRAINT "opcoes_adicionais_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "combos" ADD CONSTRAINT "combos_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "horarios_funcionamento" ADD CONSTRAINT "horarios_funcionamento_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cupons" ADD CONSTRAINT "cupons_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "faixas_taxa_entrega" ADD CONSTRAINT "faixas_taxa_entrega_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "estoque_movimentos" ADD CONSTRAINT "estoque_movimentos_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "estoque_movimentos" ADD CONSTRAINT "estoque_movimentos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "fidelidades" ADD CONSTRAINT "fidelidades_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fidelidades" ADD CONSTRAINT "fidelidades_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "movimentos_fidelidade" ADD CONSTRAINT "movimentos_fidelidade_fidelidadeId_fkey" FOREIGN KEY ("fidelidadeId") REFERENCES "fidelidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "movimentos_fidelidade" ADD CONSTRAINT "movimentos_fidelidade_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
