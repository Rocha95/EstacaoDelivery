import { Router } from 'express'
import * as controller from '../controllers/cupons.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.post('/validar', asyncHandler(controller.validar))

export default router
