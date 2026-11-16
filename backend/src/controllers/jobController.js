const jobService = require('../services/jobService')
const { created, success } = require('../utils/response')

async function list(req, res, next) {
  try {
    return success(res, await jobService.listJobs())
  } catch (err) {
    next(err)
  }
}

async function get(req, res, next) {
  try {
    return success(res, await jobService.getJob(parseInt(req.params.jobId, 10)))
  } catch (err) {
    next(err)
  }
}

async function create(req, res, next) {
  try {
    const job = await jobService.createJob(req.body, req.user?.userId)
    return created(res, job)
  } catch (err) {
    next(err)
  }
}

async function update(req, res, next) {
  try {
    const job = await jobService.updateJob(parseInt(req.params.jobId, 10), req.body)
    return success(res, job)
  } catch (err) {
    next(err)
  }
}

module.exports = { list, get, create, update }
