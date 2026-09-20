import { Router } from 'express'
import * as controller from '../controllers/combos.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadFotoCombo } from '../middlewares/upload.js'

const router = Router()

router.get('/', asyncHandler(controller.listar))
router.post('/', uploadFotoCombo, asyncHandler(controller.criar))
router.patch('/:id/ativo', asyncHandler(controller.alternarAtivo))
router.patch('/:id', uploadFotoCombo, asyncHandler(controller.atualizar))
router.delete('/:id', asyncHandler(controller.remover))

export default router
