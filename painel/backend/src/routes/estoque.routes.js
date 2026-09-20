import { Router } from 'express'
import * as controller from '../controllers/estoque.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'
const router = Router()
router.get('/', asyncHandler(controller.listar))
router.post('/:id/movimentacoes', asyncHandler(controller.movimentar))
router.get('/:id/movimentacoes', asyncHandler(controller.historico))
export default router
