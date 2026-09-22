import { Router } from 'express'
import * as controller from '../controllers/pagamentos.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'
const router = Router()
router.patch('/:id/confirmar-manual', asyncHandler(controller.confirmarManual))
export default router
