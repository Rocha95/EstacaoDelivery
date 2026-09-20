import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Fábrica: cria um middleware de upload de imagem único (campo "imagem")
// que salva em painel/backend/uploads/<pasta>/. Usada tanto para fotos de
// produtos quanto de adicionais — cada uma na sua própria subpasta.
function criarUploadImagem(pasta) {
  const dir = path.join(__dirname, '..', '..', 'uploads', pasta)
  fs.mkdirSync(dir, { recursive: true })

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const sufixo = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
      cb(null, `${sufixo}${path.extname(file.originalname)}`)
    },
  })

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      if (!TIPOS_ACEITOS.includes(file.mimetype)) {
        return cb(new Error('Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF.'))
      }
      cb(null, true)
    },
  }).single('imagem')
}

// Nome do campo que o frontend usa no FormData (veja Produtos.jsx / Adicionais.jsx).
export const uploadFotoProduto = criarUploadImagem('produtos')
export const uploadFotoAdicional = criarUploadImagem('adicionais')
export const uploadFotoCombo = criarUploadImagem('combos')
