import { Router } from 'express'
import categoriasRoutes from './categorias.routes.js'
import produtosRoutes from './produtos.routes.js'
import adicionaisRoutes from './adicionais.routes.js'
import combosRoutes from './combos.routes.js'
import horariosRoutes from './horarios.routes.js'
import cuponsRoutes from './cupons.routes.js'
import taxasEntregaRoutes from './taxasEntrega.routes.js'
import configuracoesRoutes from './configuracoes.routes.js'
import usuariosRoutes from './usuarios.routes.js'
import clientesRoutes from './clientes.routes.js'
import pedidosRoutes from './pedidos.routes.js'
import relatoriosRoutes from './relatorios.routes.js'
import enderecoRoutes from './enderecos.routes.js'

const router = Router()

router.get('/', (req, res) => res.json({ ok: true, servico: 'sistema-delivery-api' }))

router.use('/categorias', categoriasRoutes)
router.use('/produtos', produtosRoutes)
router.use('/adicionais', adicionaisRoutes)
router.use('/combos', combosRoutes)
router.use('/horarios', horariosRoutes)
router.use('/cupons', cuponsRoutes)
router.use('/taxas-entrega', taxasEntregaRoutes)
router.use('/configuracoes', configuracoesRoutes)
router.use('/usuarios', usuariosRoutes)
router.use('/clientes', clientesRoutes)
router.use('/pedidos', pedidosRoutes)
router.use('/relatorios', relatoriosRoutes)
router.use('/enderecos', enderecoRoutes)

export default router