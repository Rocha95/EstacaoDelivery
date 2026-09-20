import express from 'express'
import cors from 'cors'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import routes from './routes/index.js'
import { tenantContext } from './middlewares/tenant.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function uploadsDirectory() {
  if (process.env.UPLOADS_DIR) return path.resolve(process.env.UPLOADS_DIR)

  // O backend do cliente fica em <raiz>/cliente/backend/src.
  // O upload compartilhado do painel fica em <raiz>/painel/backend/uploads.
  const candidatos = [
    path.resolve(__dirname, '../../../painel/backend/uploads'),
    path.resolve(process.cwd(), '../../painel/backend/uploads'),
  ]

  return candidatos.find((pasta) => fs.existsSync(pasta)) || candidatos[0]
}

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(v => v.trim()) : true,
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))

  // O Cliente serve as imagens já cadastradas pelo Painel.
  // Em desenvolvimento, o caminho padrão aponta para a pasta compartilhada
  // do backend do Painel; em produção, use UPLOADS_DIR para um storage compartilhado.
  const pastaUploads = uploadsDirectory()
  app.use('/uploads', express.static(pastaUploads, { fallthrough: true, maxAge: '1h' }))
  app.get('/health', (req, res) => res.json({ ok: true, servico: 'cliente', uploads: pastaUploads }))

  app.use('/api', tenantContext, routes)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
