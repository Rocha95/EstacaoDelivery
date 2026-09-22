-- PIX: pedido aguardando pagamento com expiração de 10 minutos
ALTER TYPE "StatusPedido" ADD VALUE IF NOT EXISTS 'AGUARDANDO_PAGAMENTO';

ALTER TABLE "pagamentos" ADD COLUMN IF NOT EXISTS "expiraEm" TIMESTAMP(3);
