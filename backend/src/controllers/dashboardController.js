const dashboardService = require('../services/dashboardService')
const { success } = require('../utils/response')

async function stats(req, res, next) {
  try {
    return success(res, await dashboardService.getDashboardStats())
  } catch (err) {
    next(err)
  }
}

module.exports = { stats }
