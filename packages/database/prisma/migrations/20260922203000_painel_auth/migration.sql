ALTER TABLE "usuarios" ADD COLUMN "podeCriarUsuarios" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "sessoes_usuarios" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "expiraEm" TIMESTAMP(3) NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ultimoAcessoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sessoes_usuarios_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sessoes_usuarios_tokenHash_key" ON "sessoes_usuarios"("tokenHash");
CREATE INDEX "sessoes_usuarios_usuarioId_idx" ON "sessoes_usuarios"("usuarioId");
CREATE INDEX "sessoes_usuarios_expiraEm_idx" ON "sessoes_usuarios"("expiraEm");
ALTER TABLE "sessoes_usuarios" ADD CONSTRAINT "sessoes_usuarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
