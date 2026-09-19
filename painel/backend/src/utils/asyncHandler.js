// Evita repetir try/catch em cada controller: qualquer erro (síncrono ou
// de Promise) cai automaticamente no errorHandler central.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}
