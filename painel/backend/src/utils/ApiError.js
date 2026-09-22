// Erro de aplicação com status HTTP explícito e código opcional para o frontend.
export class ApiError extends Error {
  constructor(status, message, code = null) {
    super(message)
    this.status = status
    this.code = code
  }
}
