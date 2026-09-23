import { Router } from 'express'
import * as controller from '../controllers/auth.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { authContext } from '../middlewares/auth.js'
const router = Router()
router.post('/login', asyncHandler(controller.entrar))
router.get('/me', authContext, asyncHandler(controller.atual))
router.post('/logout', authContext, asyncHandler(controller.sair))
export default router
