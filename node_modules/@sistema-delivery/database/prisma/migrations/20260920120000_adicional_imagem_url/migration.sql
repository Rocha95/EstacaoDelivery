-- Permite armazenar a foto das opções de adicionais cadastradas pelo estabelecimento.
ALTER TABLE "opcoes_adicionais" ADD COLUMN IF NOT EXISTS "imagemUrl" TEXT;
