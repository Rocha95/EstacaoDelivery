import { Router } from 'express'
import * as controller from '../controllers/avaliacoes.controller.js'
import { autenticar } from '../middlewares/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
const router=Router();router.get('/pedido/:pedidoId',autenticar,asyncHandler(controller.obterPorPedido));router.post('/pedido/:pedidoId',autenticar,asyncHandler(controller.criar));export default router
