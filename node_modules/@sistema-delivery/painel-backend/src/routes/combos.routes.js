import { Router } from 'express'
import * as controller from '../controllers/combos.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(controller.listar))
router.post('/', asyncHandler(controller.criar))
router.patch('/:id/ativo', asyncHandler(controller.alternarAtivo))
router.delete('/:id', asyncHandler(controller.remover))

export default router
