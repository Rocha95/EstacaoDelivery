// O client Prisma vive em packages/database (schema único, compartilhado
// com cliente/backend). Aqui só reexportamos pra manter os imports dos
// controllers (`from '../lib/prisma.js'`) iguais aos de antes.
export { prisma } from '@sistema-delivery/database'
