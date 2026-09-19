import { Router } from 'express'
import * as controller from '../controllers/enderecos.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(controller.listar))
router.get('/:id', asyncHandler(controller.obter))
router.post('/', asyncHandler(controller.criar))
router.put('/:id', asyncHandler(controller.atualizar))
router.delete('/:id', asyncHandler(controller.remover))

export default router