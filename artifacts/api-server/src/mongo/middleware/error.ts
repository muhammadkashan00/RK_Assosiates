// @ts-nocheck
export function notFound(_req, res) {
  res.status(404).json({ message: "Not found." });
}

export function errorHandler(err, _req, res, _next) {
  console.error("[error]", err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.expose ? err.message : status === 500 ? "Internal server error." : err.message,
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
