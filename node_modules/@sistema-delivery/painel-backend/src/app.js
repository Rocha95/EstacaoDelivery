import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import routes from './routes/index.js'
import { tenantContext } from './middlewares/tenant.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  // Fotos enviadas pelo painel ficam acessíveis em /uploads/produtos/arquivo.jpg
  // — é essa URL que vai pro campo imagemUrl do produto e que o app do
  // cliente usa pra exibir a foto.
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

  app.use('/api', tenantContext, routes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
