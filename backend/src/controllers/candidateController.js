const candidateService = require('../services/candidateService')
const { success } = require('../utils/response')

async function list(req, res, next) {
  try {
    return success(res, await candidateService.listCandidates())
  } catch (err) {
    next(err)
  }
}

async function get(req, res, next) {
  try {
    return success(res, await candidateService.getCandidate(parseInt(req.params.candidateId, 10)))
  } catch (err) {
    next(err)
  }
}

async function updateStage(req, res, next) {
  try {
    const result = await candidateService.updateStage(
      parseInt(req.params.candidateId, 10),
      req.body.stage,
      req.user?.userId,
      req.body.jobId,
    )
    return success(res, result)
  } catch (err) {
    next(err)
  }
}

async function updateNotes(req, res, next) {
  try {
    const result = await candidateService.updateNotes(
      parseInt(req.params.candidateId, 10),
      req.body.notes,
    )
    return success(res, result)
  } catch (err) {
    next(err)
  }
}

module.exports = { list, get, updateStage, updateNotes }
