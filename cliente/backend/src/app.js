import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function createApp() {
  const app = express()

  // Middlewares globais
  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Servir arquivos estáticos da pasta public/uploads
  // As imagens serão acessíveis em http://localhost:3334/uploads/nome-da-foto.jpg
  app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')))

  // Rotas da API
  app.use('/api', routes)

  // Middlewares de tratamento de erros
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}