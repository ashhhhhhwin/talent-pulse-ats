const interviewRepo = require('../repositories/interviewRepository')
const matchRepo = require('../repositories/matchRepository')
const { toUiStage } = require('../utils/validation')

async function listPipeline() {
  const rows = await interviewRepo.findAllActive()
  return Promise.all(
    rows.map(async (row) => {
      const best = await matchRepo.getBestMatchForCandidate(row.CandidateId)
      return {
        candidateId: row.CandidateId,
        candidateName: row.CandidateName,
        jobId: row.JobId,
        jobTitle: row.JobTitle,
        stage: row.Stage,
        uiStage: toUiStage(row.Stage),
        notes: row.Notes,
        similarityScore: best ? Math.round(best.FinalScore) : 0,
        experienceYears: row.ExperienceYears,
      }
    }),
  )
}

module.exports = { listPipeline }
