import { Router } from 'express'
import * as controller from '../controllers/produtos.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadFotoProduto } from '../middlewares/upload.js'

const router = Router()

router.get('/', asyncHandler(controller.listar))
router.get('/:id', asyncHandler(controller.obter))
router.post('/', uploadFotoProduto, asyncHandler(controller.criar))
router.put('/:id', uploadFotoProduto, asyncHandler(controller.atualizar))
router.patch('/:id/ativo', asyncHandler(controller.alternarAtivo))
router.delete('/:id', asyncHandler(controller.remover))

export default router
