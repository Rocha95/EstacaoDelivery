import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const SELECT_PUBLICO = { 
  id: true, 
  nome: true, 
  telefone: true, 
  email: true, 
  tipo: true,
  criadoEm: true 
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_delivery_app'

export async function cadastrar(req, res) {
  const { nome, telefone, senha, email } = req.body

  if (!nome || !telefone || !senha) {
    throw new ApiError(400, 'Informe nome, celular e senha.')
  }

  // Valida se o celular já está cadastrado no banco
  const usuarioExiste = await prisma.usuario.findFirst({
    where: { telefone }
  })

  if (usuarioExiste) {
    throw new ApiError(400, 'Este número de celular já está cadastrado.')
  }

  const senhaHash = await bcrypt.hash(senha, 10)

  const usuario = await prisma.usuario.create({
    data: { 
      nome, 
      telefone, 
      email: email || null, 
      senhaHash, 
      tipo: 'CLIENTE' 
    },
    select: SELECT_PUBLICO,
  })

  return res.status(201).json(usuario)
}

export async function entrar(req, res) {
  const { telefone, senha } = req.body

  if (!telefone || !senha) {
    throw new ApiError(400, 'Informe celular e senha.')
  }

  const usuario = await prisma.usuario.findFirst({ 
    where: { telefone, tipo: 'CLIENTE' } 
  })

  if (!usuario) {
    throw new ApiError(401, 'Celular ou senha inválidos.')
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash)

  if (!senhaConfere) {
    throw new ApiError(401, 'Celular ou senha inválidos.')
  }

  // Geração do token JWT de autenticação
  const token = jwt.sign(
    { id: usuario.id, tipo: usuario.tipo },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  const { senhaHash, ...usuarioSemSenha } = usuario

  // Retorna os dados do usuário e o token esperado pelo front-end
  return res.json({
    usuario: usuarioSemSenha,
    token
  })
}