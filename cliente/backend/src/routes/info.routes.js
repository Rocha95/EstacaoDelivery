import { Router } from 'express'
import * as controller from '../controllers/info.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/configuracao', asyncHandler(controller.obterConfiguracao))
router.get('/horarios', asyncHandler(controller.listarHorarios))

export default router
