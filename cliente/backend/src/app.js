import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(v => v.trim()) : true,
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))


  app.use('/api', routes)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
