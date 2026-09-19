import { Router } from 'express'
import * as controller from '../controllers/pedidos.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.post('/', asyncHandler(controller.criar))
router.get('/', asyncHandler(controller.meusPedidos))
router.get('/:id', asyncHandler(controller.obter))

export default router
