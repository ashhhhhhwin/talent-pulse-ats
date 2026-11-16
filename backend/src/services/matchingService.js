const aiClient = require('../config/aiService')
const env = require('../config/env')
const jobRepo = require('../repositories/jobRepository')
const candidateRepo = require('../repositories/candidateRepository')
const matchRepo = require('../repositories/matchRepository')
const resumeRepo = require('../repositories/resumeRepository')
const { AppError } = require('../middleware/errorMiddleware')
const logger = require('../utils/logger')

function formatMatchRow(row) {
  return {
    candidateId: row.CandidateId,
    candidateName: row.CandidateName || row.Name,
    semanticScore: Number(row.SemanticScore),
    skillScore: Number(row.SkillScore),
    experienceScore: Number(row.ExperienceScore),
    mandatoryScore: Number(row.MandatoryScore),
    finalScore: Number(row.FinalScore),
    matchedSkills: JSON.parse(row.MatchedSkills || '[]'),
    missingSkills: JSON.parse(row.MissingSkills || '[]'),
    explanation: row.Explanation,
    experienceYears: row.ExperienceYears,
    currentTitle: row.CurrentTitle,
  }
}

async function runMatching(jobId) {
  const job = await jobRepo.findById(jobId)
  if (!job) throw new AppError('Job not found', 404)

  const jobSkills = await jobRepo.getSkills(jobId)
  const candidates = await candidateRepo.findAll()
  const results = []

  for (const candidate of candidates) {
    const skills = await candidateRepo.getSkills(candidate.CandidateId)
    const resumes = await resumeRepo.findByCandidateId(candidate.CandidateId)
    const text = resumes[0]?.ExtractedText || `${candidate.Summary || ''} ${skills.map((s) => s.SkillName).join(' ')}`

    const scored = await scoreCandidateForJob(candidate, skills, job, jobSkills, text)
    await matchRepo.upsert(scored)
    results.push(formatMatchRow({ ...scored, CandidateName: candidate.Name, ExperienceYears: candidate.ExperienceYears, CurrentTitle: candidate.CurrentTitle }))
  }

  results.sort((a, b) => b.finalScore - a.finalScore)
  return { jobId, count: results.length, results }
}

async function getResults(jobId, topN = null) {
  const job = await jobRepo.findById(jobId)
  if (!job) throw new AppError('Job not found', 404)
  const rows = await matchRepo.findByJob(jobId, topN)
  return rows.map(formatMatchRow)
}

async function getCandidateMatch(jobId, candidateId) {
  const row = await matchRepo.findByJobAndCandidate(jobId, candidateId)
  if (!row) throw new AppError('Match not found', 404)
  return formatMatchRow(row)
}

function extractSkillNames(skillRows) {
  return skillRows
    .map((s) => (typeof s === 'string' ? s : s.SkillName || s.skillName))
    .filter(Boolean)
}

async function scoreCandidateForJob(candidate, skillRows, job, jobSkillRows, resumeText) {
  const candidateSkills = extractSkillNames(skillRows)
  const requiredSkills = jobSkillRows.filter((s) => s.IsMandatory).map((s) => s.SkillName)
  const preferredSkills = jobSkillRows.filter((s) => !s.IsMandatory).map((s) => s.SkillName)

  const payload = {
    job: {
      title: job.Title,
      description: job.Description,
      required_skills: requiredSkills,
      preferred_skills: preferredSkills,
      minimum_experience: job.MinimumExperience,
    },
    candidate: {
      name: candidate.Name,
      skills: candidateSkills,
      experience_years: candidate.ExperienceYears,
      education: candidate.Education ? [candidate.Education] : [],
      resume_text: resumeText,
    },
    weights: env.weights,
  }

  try {
    const { data } = await aiClient.post('/ai/match', payload)
    return {
      jobId: job.JobId,
      candidateId: candidate.CandidateId,
      semanticScore: data.semantic_score,
      skillScore: data.skill_score,
      experienceScore: data.experience_score,
      mandatoryScore: data.mandatory_score,
      finalScore: data.final_score,
      matchedSkills: data.matched_skills,
      missingSkills: data.missing_skills,
      explanation: data.explanation,
    }
  } catch (err) {
    logger.warn('AI match unavailable, using local scoring fallback')
    return localScore(candidate, candidateSkills, job, requiredSkills, preferredSkills, resumeText)
  }
}

function localScore(candidate, candidateSkills, job, requiredSkills, preferredSkills, resumeText) {
  const safeSkills = candidateSkills.filter(Boolean)
  const candNorm = new Set(safeSkills.map((s) => s.toLowerCase()))
  const matchedRequired = requiredSkills.filter((s) => candNorm.has(s.toLowerCase()) || fuzzyHas(candNorm, s))
  const matchedPreferred = preferredSkills.filter((s) => candNorm.has(s.toLowerCase()) || fuzzyHas(candNorm, s))
  const missingRequired = requiredSkills.filter((s) => !matchedRequired.includes(s))
  const missingPreferred = preferredSkills.filter((s) => !matchedPreferred.includes(s))

  const mandatoryScore = requiredSkills.length
    ? (matchedRequired.length / requiredSkills.length) * 100
    : 100

  const allJobSkills = [...requiredSkills, ...preferredSkills]
  const allMatched = [...matchedRequired, ...matchedPreferred]
  const skillScore = allJobSkills.length ? (allMatched.length / allJobSkills.length) * 100 : 0

  const exp = candidate.ExperienceYears || 0
  const minExp = job.MinimumExperience || 0
  let experienceScore = 100
  if (exp < minExp) {
    experienceScore = Math.max(0, (exp / Math.max(minExp, 1)) * 100)
  }

  const semanticScore = Math.min(100, Math.round((skillScore * 0.6 + experienceScore * 0.4)))

  const w = env.weights
  const finalScore = Math.round(
    w.semantic * semanticScore +
      w.skill * skillScore +
      w.experience * experienceScore +
      w.mandatory * mandatoryScore,
  )

  const explanation = [
    `Matched ${allMatched.length} of ${allJobSkills.length} skills.`,
    missingRequired.length ? `Missing mandatory: ${missingRequired.join(', ')}.` : 'All mandatory skills present.',
    `Experience: ${exp} years vs ${minExp} required.`,
  ].join(' ')

  return {
    jobId: job.JobId,
    candidateId: candidate.CandidateId,
    semanticScore,
    skillScore: Math.round(skillScore),
    experienceScore: Math.round(experienceScore),
    mandatoryScore: Math.round(mandatoryScore),
    finalScore,
    matchedSkills: allMatched,
    missingSkills: [...missingRequired, ...missingPreferred],
    explanation,
  }
}

function fuzzyHas(set, skill) {
  const target = skill.toLowerCase()
  for (const s of set) {
    if (s.includes(target) || target.includes(s)) return true
  }
  return false
}

module.exports = { runMatching, getResults, getCandidateMatch, scoreCandidateForJob, formatMatchRow }
