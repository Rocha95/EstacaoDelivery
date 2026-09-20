import { Router } from 'express'
import * as controller from '../controllers/cozinha.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'
const router = Router()
router.get('/', asyncHandler(controller.listar))
router.patch('/:id/iniciar', asyncHandler(controller.iniciar))
export default router
