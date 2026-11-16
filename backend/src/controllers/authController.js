const authService = require('../services/authService')
const { created, success } = require('../utils/response')

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body)
    return created(res, result)
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body)
    return success(res, result)
  } catch (err) {
    next(err)
  }
}

async function profile(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.userId)
    return success(res, user)
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, profile }
