const logger = require('../utils/logger')
const { error } = require('../utils/response')

class AppError extends Error {
  constructor(message, status = 500, errors = null) {
    super(message)
    this.status = status
    this.errors = errors
    this.isOperational = true
  }
}

function notFound(req, res) {
  return error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404)
}

function errorHandler(err, req, res, _next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return error(res, 'File too large', 413)
  }
  if (err.code === 'INVALID_FILE_TYPE') {
    return error(res, err.message, 400)
  }

  const status = err.status || err.statusCode || 500
  const message = err.isOperational ? err.message : 'Internal server error'

  if (!err.isOperational) {
    logger.error('Unhandled error', { message: err.message, stack: err.stack })
  }

  return error(res, message, status, err.errors || undefined)
}

module.exports = { AppError, notFound, errorHandler }
