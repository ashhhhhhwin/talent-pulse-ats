const resumeService = require('../services/resumeService')
const { created } = require('../utils/response')

async function upload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resume file is required' })
    }
    const jobId = req.body.jobId ? parseInt(req.body.jobId, 10) : null
    const result = await resumeService.uploadResume(req.file, jobId)
    return created(res, result)
  } catch (err) {
    next(err)
  }
}

module.exports = { upload }
