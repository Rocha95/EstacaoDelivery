import { Router } from 'express'
import * as controller from '../controllers/rotas.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { autenticar } from '../middlewares/auth.js'

const router = Router()
router.use(autenticar)
router.get('/endereco/:enderecoId', asyncHandler(controller.calcularParaEndereco))
export default router
