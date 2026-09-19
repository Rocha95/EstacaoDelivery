// Se tiver um arquivo de banco/model, importe aqui:
// import * as enderecoService from '../services/enderecos.service.js'

export async function listar(req, res) {
  // Exemplo de busca no banco/service:
  // const enderecos = await enderecoService.listar(req.query)
  const enderecos = [] 

  return res.json(enderecos)
}

export async function obter(req, res) {
  const { id } = req.params
  // const endereco = await enderecoService.obterPorId(id)

  if (!endereco) {
    return res.status(404).json({ message: 'Endereço não encontrado.' })
  }

  return res.json(endereco)
}

export async function criar(req, res) {
  const { cliente_id, apelido, logradouro, numero, bairro, complemento, cidade, uf, cep } = req.body

  if (!logradouro) {
    return res.status(400).json({ message: 'O logradouro/rua é obrigatório.' })
  }

  // const novoEndereco = await enderecoService.criar(req.body)
  const novoEndereco = { id: String(Date.now()), ...req.body }

  return res.status(201).json(novoEndereco)
}

export async function atualizar(req, res) {
  const { id } = req.params

  // const enderecoAtualizado = await enderecoService.atualizar(id, req.body)

  return res.json({ message: 'Endereço atualizado com sucesso.' })
}

export async function remover(req, res) {
  const { id } = req.params

  // await enderecoService.remover(id)

  return res.status(204).send()
}