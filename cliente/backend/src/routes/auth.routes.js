import { Router } from 'express'
import * as controller from '../controllers/auth.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// Endpoints em inglês (utilizados pelo front-end refatorado)
router.post('/register', asyncHandler(controller.cadastrar))
router.post('/login', asyncHandler(controller.entrar))

// Endpoints em português (mantidos para retrocompatibilidade)
router.post('/cadastrar', asyncHandler(controller.cadastrar))
router.post('/entrar', asyncHandler(controller.entrar))

export default router