import { PrismaClient } from '@prisma/client'

// Instância única do Prisma, compartilhada pelos dois backends
// (painel/backend e cliente/backend) — um banco só, um schema só.
export const prisma = new PrismaClient()
export * from '@prisma/client'
