import 'dotenv/config'
import { createApp } from './app.js'

const PORT = process.env.PORT || 3333

const app = createApp()

app.listen(PORT, () => {
  console.log(`API do sistema de pedidos e delivery rodando em http://localhost:${PORT}/api`)
})
