import { Router } from 'express'
import * as controller from '../controllers/catalogo.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/categorias', asyncHandler(controller.listarCategorias))
router.get('/produtos', asyncHandler(controller.listarProdutos))
router.get('/produtos/:id', asyncHandler(controller.obterProduto))
router.get('/combos', asyncHandler(controller.listarCombos))

export default router
