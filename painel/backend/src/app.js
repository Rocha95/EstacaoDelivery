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

  // CORS: origens configuradas + hosts locais do Painel em desenvolvimento.
  const configuredOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  const allowedOrigins = new Set([
    ...configuredOrigins,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ])

  const corsOptions = {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true)
      }

      return callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Accept',
      'Content-Type',
      'Authorization',
      'X-Estabelecimento-Id',
    ],
    optionsSuccessStatus: 204,
  }

  app.use(cors(corsOptions))
  app.options('*', cors(corsOptions))
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
