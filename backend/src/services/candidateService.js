const candidateRepo = require('../repositories/candidateRepository')
const matchRepo = require('../repositories/matchRepository')
const interviewRepo = require('../repositories/interviewRepository')
const resumeService = require('./resumeService')
const { AppError } = require('../middleware/errorMiddleware')
const { normalizeStage, toUiStage } = require('../utils/validation')

async function listCandidates() {
  const rows = await candidateRepo.findAll()
  return Promise.all(rows.map((c) => resumeService.formatCandidate(c.CandidateId)))
}

async function getCandidate(candidateId) {
  const candidate = await candidateRepo.findById(candidateId)
  if (!candidate) throw new AppError('Candidate not found', 404)
  return resumeService.formatCandidate(candidateId)
}

async function updateStage(candidateId, stage, userId, jobId = null) {
  const candidate = await candidateRepo.findById(candidateId)
  if (!candidate) throw new AppError('Candidate not found', 404)

  const dbStage = normalizeStage(stage)
  let resolvedJobId = jobId
  if (!resolvedJobId) {
    const best = await matchRepo.getBestMatchForCandidate(candidateId)
    resolvedJobId = best?.JobId
  }
  if (!resolvedJobId) throw new AppError('No job associated with candidate', 400)

  const { previous, current } = await interviewRepo.upsert({
    candidateId,
    jobId: resolvedJobId,
    stage: dbStage,
  })

  await interviewRepo.addHistory({
    candidateId,
    jobId: resolvedJobId,
    previousStage: previous,
    newStage: dbStage,
    changedBy: userId,
  })

  return {
    candidateId,
    stage: dbStage,
    uiStage: toUiStage(dbStage),
    interview: current,
  }
}

async function updateNotes(candidateId, notes) {
  const candidate = await candidateRepo.findById(candidateId)
  if (!candidate) throw new AppError('Candidate not found', 404)
  await interviewRepo.updateNotes(candidateId, notes)
  return { candidateId, notes }
}

module.exports = { listCandidates, getCandidate, updateStage, updateNotes }
