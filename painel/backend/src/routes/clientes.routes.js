import { Router } from 'express'
import * as controller from '../controllers/clientes.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(controller.listar))
router.get('/:id', asyncHandler(controller.obter))

export default router
