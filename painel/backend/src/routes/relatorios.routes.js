import { Router } from 'express'
import * as controller from '../controllers/relatorios.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/resumo', asyncHandler(controller.resumo))
router.get('/vendas-por-dia', asyncHandler(controller.vendasPorDia))
router.get('/mais-vendidos', asyncHandler(controller.maisVendidos))

export default router
