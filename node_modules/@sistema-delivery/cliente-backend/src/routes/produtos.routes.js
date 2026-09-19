import { Router } from 'express'
import multer from 'multer'
import { upload } from '../middlewares/upload.js' // Ajuste o caminho caso seu middleware esteja em outro diretório

const router = Router()

// Banco de dados em memória para testes/fallback (substitua pela chamada do seu ORM/Banco se houver)
let produtos = []

// GET /api/produtos - Listar todos os produtos
router.get('/', (req, res) => {
  try {
    return res.status(200).json(produtos)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return res.status(500).json({ message: 'Erro interno ao buscar produtos.' })
  }
})

// POST /api/produtos - Criar novo produto com suporte a upload de arquivo (FormData)
router.post('/', (req, res) => {
  upload.single('imagem')(req, res, async (err) => {
    // 1. Tratamento de erros do Multer (limite de tamanho, formato de imagem inválido)
    if (err instanceof multer.MulterError) {
      console.error('Erro de upload do Multer:', err.message)
      return res.status(400).json({ message: `Erro no upload: ${err.message}` })
    } else if (err) {
      console.error('Erro no filtro de arquivo:', err.message)
      return res.status(400).json({ message: err.message })
    }

    try {
      // 2. Extrai os campos do FormData
      const { nome, descricao, categoria, preco, disponibilidadeInicio, disponibilidadeFim } = req.body

      if (!nome || !preco) {
        return res.status(400).json({ message: 'Nome e preço são obrigatórios.' })
      }

      // 3. Define a URL/caminho da imagem enviada ou URL colada
      let imagemUrl = ''
      if (req.file) {
        imagemUrl = `/uploads/${req.file.filename}`
      } else if (req.body.imagemUrl) {
        imagemUrl = req.body.imagemUrl
      }

      // 4. Cria a estrutura do novo produto
      const novoProduto = {
        id: Date.now(),
        nome,
        descricao: descricao || '',
        categoria: categoria || 'Geral',
        preco: parseFloat(preco) || 0,
        disponibilidadeInicio: disponibilidadeInicio || '11:00',
        disponibilidadeFim: disponibilidadeFim || '23:00',
        imagem: imagemUrl,
        ativo: true,
        criadoEm: new Date(),
      }

      // Se você estiver utilizando Banco de Dados (Prisma, Mongoose, Knex, etc.), salve aqui:
      // const produtoSalvo = await db.produto.create({ data: novoProduto })
      
      produtos.push(novoProduto)

      return res.status(201).json(novoProduto)
    } catch (dbError) {
      console.error('Erro ao salvar produto:', dbError)
      return res.status(500).json({ message: 'Erro interno ao salvar produto.' })
    }
  })
})

// PATCH /api/produtos/:id - Atualizar status de ativo/inativo
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params
    const { ativo } = req.body

    const produtoIndex = produtos.findIndex((p) => String(p.id) === String(id))

    if (produtoIndex !== -1) {
      produtos[produtoIndex].ativo = Boolean(ativo)
      return res.status(200).json(produtos[produtoIndex])
    }

    return res.status(200).json({ id, ativo, message: 'Status atualizado' })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return res.status(500).json({ message: 'Erro ao atualizar produto.' })
  }
})

export default router