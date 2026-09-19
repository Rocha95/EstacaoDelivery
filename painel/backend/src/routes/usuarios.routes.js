import { Router } from 'express'
import * as controller from '../controllers/usuarios.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(controller.listar))
router.post('/', asyncHandler(controller.criar))
router.put('/:id', asyncHandler(controller.atualizar))
router.patch('/:id/ativo', asyncHandler(controller.alternarAtivo))
router.delete('/:id', asyncHandler(controller.remover))

export default router
