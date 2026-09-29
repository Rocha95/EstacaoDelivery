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

  // CORS: aceita as origens configuradas e os hosts locais usados
  // pelos frontends em desenvolvimento. Isso também cobre o preflight
  // (OPTIONS) das requisições que usam Authorization e
  // X-Estabelecimento-Id.
  const configuredOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  const allowedOrigins = new Set([
    ...configuredOrigins,
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ])

  const corsOptions = {
    origin(origin, callback) {
      // Navegadores normalmente enviam Origin; chamadas internas/health
      // podem não enviar.
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
