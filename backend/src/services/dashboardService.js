const candidateRepo = require('../repositories/candidateRepository')
const jobRepo = require('../repositories/jobRepository')
const matchRepo = require('../repositories/matchRepository')
const interviewRepo = require('../repositories/interviewRepository')

async function getDashboardStats() {
  const [candidates, jobs, interviews] = await Promise.all([
    candidateRepo.findAll(),
    jobRepo.findAll(),
    interviewRepo.findAllActive(),
  ])

  let totalScore = 0
  let scoredCount = 0
  for (const c of candidates) {
    const best = await matchRepo.getBestMatchForCandidate(c.CandidateId)
    if (best) {
      totalScore += Number(best.FinalScore)
      scoredCount += 1
    }
  }

  const inPipeline = interviews.filter((i) => i.Stage !== 'OFFER_EXTENDED').length
  const offers = interviews.filter((i) => i.Stage === 'OFFER_EXTENDED').length

  return {
    totalCandidates: candidates.length,
    openJobs: jobs.filter((j) => j.Status === 'Open').length,
    inPipeline,
    offers,
    hired: 0,
    avgScore: scoredCount ? Math.round(totalScore / scoredCount) : 0,
    profilesParsed: candidates.length,
    awaitingAction: candidates.length - inPipeline - offers,
  }
}

module.exports = { getDashboardStats }
