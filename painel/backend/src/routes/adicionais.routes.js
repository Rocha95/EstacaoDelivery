import { Router } from 'express'
import * as controller from '../controllers/adicionais.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadFotoAdicional } from '../middlewares/upload.js'

const router = Router()

// Endpoints planos, usados pela tela de Adicionais do painel.
router.get('/', asyncHandler(controller.listar))
router.post('/', uploadFotoAdicional, asyncHandler(controller.criar))
router.patch('/:id', uploadFotoAdicional, asyncHandler(controller.atualizar))
router.delete('/:id', asyncHandler(controller.removerFlat))

// Endpoints relacionais (grupos/opções), usados onde a estrutura completa
// (limite de seleção, obrigatoriedade) importa — ex: vínculo com produtos.
router.get('/grupos', asyncHandler(controller.listarGrupos))
router.post('/grupos', asyncHandler(controller.criarGrupo))
router.put('/grupos/:id', asyncHandler(controller.atualizarGrupo))
router.delete('/grupos/:id', asyncHandler(controller.removerGrupo))

router.post('/grupos/:grupoId/opcoes', asyncHandler(controller.criarOpcao))
router.put('/opcoes/:id', asyncHandler(controller.atualizarOpcao))
router.patch('/opcoes/:id/ativo', asyncHandler(controller.alternarOpcaoAtiva))
router.delete('/opcoes/:id', asyncHandler(controller.removerOpcao))

export default router
