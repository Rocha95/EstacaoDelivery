import { Router } from 'express'
import * as controller from '../controllers/pagamentos.controller.js'
import { autenticar } from '../middlewares/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
const router=Router()
router.post('/webhook', asyncHandler(controller.webhook))
router.get('/:pedidoId', autenticar, asyncHandler(controller.consultar))
export default router
