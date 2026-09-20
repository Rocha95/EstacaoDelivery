-- DropForeignKey
ALTER TABLE "opcoes_adicionais" DROP CONSTRAINT "opcoes_adicionais_grupoId_fkey";

-- DropIndex
DROP INDEX "opcoes_adicionais_categoriaId_idx";

-- AddForeignKey
ALTER TABLE "opcoes_adicionais" ADD CONSTRAINT "opcoes_adicionais_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos_adicionais"("id") ON DELETE SET NULL ON UPDATE CASCADE;
