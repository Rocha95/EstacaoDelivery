import { Router } from 'express'
import * as controller from '../controllers/taxasEntrega.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/faixas', asyncHandler(controller.listarFaixas))
router.post('/faixas', asyncHandler(controller.criarFaixa))
router.put('/faixas/:id', asyncHandler(controller.atualizarFaixa))
router.delete('/faixas/:id', asyncHandler(controller.removerFaixa))

export default router
