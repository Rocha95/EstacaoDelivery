import { autenticarToken, tokenDoRequest } from '../services/auth.js'
import { ApiError } from '../utils/ApiError.js'

export async function authContext(req, res, next) {
  try {
    const sessao = await autenticarToken(tokenDoRequest(req), req.estabelecimentoId)
    req.usuario = sessao.usuario
    req.sessao = sessao
    next()
  } catch (err) { next(err) }
}

export function requireCriarUsuarios(req, res, next) {
  if (req.usuario?.papel !== 'ADMINISTRADOR' || !req.usuario?.podeCriarUsuarios) {
    return next(new ApiError(403, 'Você não possui permissão para criar usuários.'))
  }
  next()
}
