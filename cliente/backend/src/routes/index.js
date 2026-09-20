import { Router } from 'express'
import catalogoRoutes from './catalogo.routes.js'
import infoRoutes from './info.routes.js'
import authRoutes from './auth.routes.js'
import enderecosRoutes from './enderecos.routes.js'
import cuponsRoutes from './cupons.routes.js'
import rotasRoutes from './rotas.routes.js'
import taxasEntregaRoutes from './taxasEntrega.routes.js'
import pedidosRoutes from './pedidos.routes.js'
import pagamentosRoutes from './pagamentos.routes.js'
import avaliacoesRoutes from './avaliacoes.routes.js'
import fidelidadeRoutes from './fidelidade.routes.js'

const router = Router()

router.get('/', (req, res) => res.json({ ok: true, servico: 'sistema-delivery-cliente-backend' }))

router.use('/', catalogoRoutes) // /categorias, /produtos, /combos (públicos)
router.use('/', infoRoutes) // /configuracao, /horarios (públicos)
router.use('/auth', authRoutes)
router.use('/enderecos', enderecosRoutes)
router.use('/cupons', cuponsRoutes)
router.use('/rotas', rotasRoutes)
router.use('/taxas-entrega', taxasEntregaRoutes)
router.use('/pedidos', pedidosRoutes)
router.use('/pagamentos', pagamentosRoutes)
router.use('/avaliacoes', avaliacoesRoutes)
router.use('/fidelidade', fidelidadeRoutes)

export default router
