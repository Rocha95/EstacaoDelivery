import { Router } from 'express'
import * as controller from '../controllers/taxasEntrega.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/calcular', asyncHandler(controller.calcular))

export default router
