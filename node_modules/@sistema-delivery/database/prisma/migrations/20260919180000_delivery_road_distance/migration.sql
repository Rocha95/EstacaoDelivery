-- Delivery: permite agendamento de pedidos.
ALTER TABLE "pedidos" ADD COLUMN IF NOT EXISTS "agendadoPara" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "pedidos_agendadoPara_idx" ON "pedidos"("agendadoPara");
