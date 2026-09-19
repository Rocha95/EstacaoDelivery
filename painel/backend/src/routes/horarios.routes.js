import { Router } from 'express'
import * as controller from '../controllers/horarios.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(controller.listar))
router.put('/:diaSemana', asyncHandler(controller.atualizarDia))

export default router
