import { Router } from 'express'
import * as controller from '../controllers/configuracoes.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(controller.obter))
router.put('/', asyncHandler(controller.atualizar))

export default router
