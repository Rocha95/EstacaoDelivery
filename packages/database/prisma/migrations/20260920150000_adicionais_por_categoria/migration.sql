-- Adicionais passam a pertencer diretamente à mesma Categoria dos produtos.
-- grupo_id fica opcional para preservar dados legados sem manter a regra de negócio antiga.
ALTER TABLE "opcoes_adicionais" ADD COLUMN "categoriaId" TEXT;
ALTER TABLE "opcoes_adicionais" ALTER COLUMN "grupoId" DROP NOT NULL;

-- Migra automaticamente opções antigas para a primeira categoria encontrada
-- entre os produtos que utilizavam o antigo grupo de adicionais.
UPDATE "opcoes_adicionais" oa
SET "categoriaId" = (
  SELECT p."categoriaId"
  FROM "produto_grupo_adicional" pga
  JOIN "produtos" p ON p."id" = pga."produtoId"
  WHERE pga."grupoId" = oa."grupoId"
  ORDER BY p."categoriaId"
  LIMIT 1
)
WHERE oa."categoriaId" IS NULL AND oa."grupoId" IS NOT NULL;

CREATE INDEX "opcoes_adicionais_categoriaId_idx" ON "opcoes_adicionais"("categoriaId");
ALTER TABLE "opcoes_adicionais" ADD CONSTRAINT "opcoes_adicionais_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
