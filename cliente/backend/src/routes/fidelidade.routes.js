import { Router } from 'express'
import * as controller from '../controllers/fidelidade.controller.js'
import { autenticar } from '../middlewares/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
const router=Router();router.get('/',autenticar,asyncHandler(controller.obter));router.get('/historico',autenticar,asyncHandler(controller.historico));export default router
