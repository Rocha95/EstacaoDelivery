-- Permite armazenar a foto do combo.
ALTER TABLE "combos" ADD COLUMN IF NOT EXISTS "imagemUrl" TEXT;
