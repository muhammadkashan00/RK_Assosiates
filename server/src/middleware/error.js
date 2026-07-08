export function notFound(req, res) {
  res.status(404).json({ error: "Not found." })
}

// Centralized error handler. Never leaks stack traces in production.
export function errorHandler(err, req, res, _next) {
  console.error("[error]", err.message)
  const status = err.status || err.statusCode || 500
  res.status(status).json({
    error: err.expose ? err.message : status === 500 ? "Internal server error." : err.message,
  })
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}
