import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function uploadsDirectory() {
  return process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(__dirname, '../../../painel/backend/uploads')
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
  app.use('/uploads', express.static(uploadsDirectory(), { fallthrough: true, maxAge: '1h' }))

  app.use('/api', routes)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
