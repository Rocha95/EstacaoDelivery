// Erro de aplicação com status HTTP explícito — use throw new ApiError(404, 'mensagem')
// dentro de qualquer controller para retornar um erro tratado.
export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
