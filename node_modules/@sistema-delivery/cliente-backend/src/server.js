import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { createApp } from './app.js'
import { expirarPixPendentes } from './services/expiracaoPix.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

const PORT = process.env.PORT || 3334
const app = createApp()

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}/api`)
  console.log(`Imagens do Cliente disponíveis em http://localhost:${PORT}/uploads/`)
  const executarExpiracao = () => expirarPixPendentes().then((total) => { if (total) console.log(`[PIX] ${total} pedido(s) expirado(s) automaticamente.`) }).catch((err) => console.error('[PIX] Erro ao expirar pagamentos:', err.message))
  executarExpiracao()
  setInterval(executarExpiracao, 15 * 1000)
})
