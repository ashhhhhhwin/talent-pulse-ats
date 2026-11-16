const interviewService = require('../services/interviewService')
const { success } = require('../utils/response')

async function list(req, res, next) {
  try {
    return success(res, await interviewService.listPipeline())
  } catch (err) {
    next(err)
  }
}

module.exports = { list }
