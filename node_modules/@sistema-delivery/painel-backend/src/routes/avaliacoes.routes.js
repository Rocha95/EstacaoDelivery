import { Router } from 'express'
import * as controller from '../controllers/avaliacoes.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'
const router = Router()
router.get('/', asyncHandler(controller.listar))
router.patch('/:id/responder', asyncHandler(controller.responder))
export default router
