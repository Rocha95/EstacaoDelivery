import { Router } from 'express'
import * as controller from '../controllers/pedidos.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

/**
 * Middleware para validar a presença e formato do ID na requisição
 */
const validarId = (req, res, next) => {
  const { id } = req.params
  if (!id || id.trim() === '') {
    return res.status(400).json({ error: 'O ID do pedido é obrigatório.' })
  }
  next()
}

// ----------------------------------------------------
// Rotas Principais do Recurso /api/pedidos
// ----------------------------------------------------

router.route('/')
  .get(asyncHandler(controller.listar))
  .post(asyncHandler(controller.criar || controller.salvar)) // Suporte a criação de novos pedidos

router.route('/:id')
  .all(validarId)
  .get(asyncHandler(controller.obter))
  // Atualização genérica de status ou dados do pedido (RESTful)
  .patch(asyncHandler(controller.avancarStatus))
  .put(asyncHandler(controller.atualizar || controller.atualizarStatus))
  .delete(asyncHandler(controller.deletar || controller.cancelar))

// ----------------------------------------------------
// Rotas Específicas de Ação (Avançar / Cancelar / Status)
// ----------------------------------------------------

// Transições diretas de máquina de estados
router.patch('/:id/avancar', validarId, asyncHandler(controller.avancarStatus))
router.patch('/:id/cancelar', validarId, asyncHandler(controller.cancelar))

// Alias para compatibilidade com o endpoint /:id/status do frontend
router.patch(
  '/:id/status',
  validarId,
  asyncHandler(controller.avancarStatus)
)

export default router