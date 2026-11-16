const jwt = require('jsonwebtoken')
const env = require('../config/env')
const { error } = require('../utils/response')

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return error(res, 'Authentication required', 401)
  }
  const token = header.slice(7)
  try {
    req.user = jwt.verify(token, env.jwt.secret)
    next()
  } catch {
    return error(res, 'Invalid or expired token', 401)
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.roleName)) {
      return error(res, 'Insufficient permissions', 403)
    }
    next()
  }
}

module.exports = { authMiddleware, requireRoles }
