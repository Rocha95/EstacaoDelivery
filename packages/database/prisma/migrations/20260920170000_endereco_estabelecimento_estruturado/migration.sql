-- Armazena o endereço do estabelecimento em campos estruturados.
ALTER TABLE "configuracoes" ADD COLUMN "enderecoRua" TEXT;
ALTER TABLE "configuracoes" ADD COLUMN "enderecoNumero" TEXT;
ALTER TABLE "configuracoes" ADD COLUMN "enderecoBairro" TEXT;
ALTER TABLE "configuracoes" ADD COLUMN "enderecoCidade" TEXT;
ALTER TABLE "configuracoes" ADD COLUMN "enderecoEstado" TEXT;
ALTER TABLE "configuracoes" ADD COLUMN "enderecoCep" TEXT;
