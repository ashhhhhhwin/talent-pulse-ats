const matchingService = require('../services/matchingService')
const { success } = require('../utils/response')

async function run(req, res, next) {
  try {
    const jobId = parseInt(req.params.jobId, 10)
    return success(res, await matchingService.runMatching(jobId))
  } catch (err) {
    next(err)
  }
}

async function results(req, res, next) {
  try {
    const jobId = parseInt(req.params.jobId, 10)
    const topN = req.query.top ? parseInt(req.query.top, 10) : null
    return success(res, await matchingService.getResults(jobId, topN))
  } catch (err) {
    next(err)
  }
}

async function candidateResult(req, res, next) {
  try {
    const jobId = parseInt(req.params.jobId, 10)
    const candidateId = parseInt(req.params.candidateId, 10)
    return success(res, await matchingService.getCandidateMatch(jobId, candidateId))
  } catch (err) {
    next(err)
  }
}

module.exports = { run, results, candidateResult }
