const fs = require('fs')
const path = require('path')
const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')
const aiClient = require('../config/aiService')
const candidateRepo = require('../repositories/candidateRepository')
const resumeRepo = require('../repositories/resumeRepository')
const matchRepo = require('../repositories/matchRepository')
const jobRepo = require('../repositories/jobRepository')
const matchingService = require('./matchingService')
const { AppError } = require('../middleware/errorMiddleware')
const logger = require('../utils/logger')

async function extractTextFromFile(filePath, mimetype) {
  const buffer = fs.readFileSync(filePath)
  const ext = path.extname(filePath).toLowerCase()

  if (mimetype === 'application/pdf' || ext === '.pdf') {
    const data = await pdfParse(buffer)
    return data.text
  }
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === '.docx'
  ) {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }
  if (mimetype === 'application/msword' || ext === '.doc') {
    throw new AppError('Legacy .doc files are not supported. Please upload PDF or DOCX.', 400)
  }
  throw new AppError('Unsupported file format', 400)
}

async function parseWithAi(text) {
  try {
    const { data } = await aiClient.post('/ai/parse-resume', { text })
    return data
  } catch (err) {
    logger.warn('AI parse unavailable, using fallback heuristics')
    return fallbackParse(text)
  }
}

function fallbackParse(text) {
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)
  const phoneMatch = text.match(/(\+?\d[\d\s-]{8,}\d)/)
  const yearsMatch = text.match(/(\d+)\+?\s*(years|yrs)/i)
  return {
    name: 'Unknown Candidate',
    email: emailMatch?.[0] || null,
    phone: phoneMatch?.[0]?.trim() || null,
    skills: extractSkillsFromText(text),
    experience_years: yearsMatch ? parseInt(yearsMatch[1], 10) : 0,
    education: [],
    certifications: [],
    projects: [],
    organizations: [],
    job_titles: [],
    summary: text.slice(0, 300),
  }
}

function extractSkillsFromText(text) {
  const catalog = [
    'React', 'Node.js', 'Express', 'TypeScript', 'JavaScript', 'Python', 'SQL',
    'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Kubernetes', 'Tailwind CSS',
    'Redux', 'Jest', 'REST APIs', 'GraphQL', 'Next.js', 'Terraform', 'CI/CD',
  ]
  const lower = text.toLowerCase()
  return catalog.filter((s) => lower.includes(s.toLowerCase()))
}

function asEducationString(education) {
  if (!education) return null
  if (Array.isArray(education)) {
    return education
      .map((item) => (typeof item === 'string' ? item : item?.degree || item?.name || String(item)))
      .filter(Boolean)
      .join('; ')
      .slice(0, 500)
  }
  return String(education).slice(0, 500)
}

async function uploadResume(file, jobId = null) {
  const extractedText = await extractTextFromFile(file.path, file.mimetype)
  if (!extractedText?.trim()) {
    throw new AppError('Could not extract text from resume', 422)
  }

  const parsed = await parseWithAi(extractedText)
  const candidate = await candidateRepo.create({
    name: String(parsed.name || 'Unknown Candidate').slice(0, 120),
    email: parsed.email ? String(parsed.email).slice(0, 255) : null,
    phone: parsed.phone ? String(parsed.phone).slice(0, 50) : null,
    experienceYears: Number.parseInt(parsed.experience_years, 10) || 0,
    education: asEducationString(parsed.education),
    currentTitle: parsed.job_titles?.[0] ? String(parsed.job_titles[0]).slice(0, 200) : null,
    location: parsed.location ? String(parsed.location).slice(0, 120) : null,
    summary: parsed.summary ? String(parsed.summary).slice(0, 4000) : null,
  })

  const skills = (parsed.skills || [])
    .map((s) => String(s || '').trim())
    .filter(Boolean)
    .map((s) => ({
      skillName: s.slice(0, 120),
      skillNormalized: s.toLowerCase().slice(0, 120),
    }))
  await candidateRepo.setSkills(candidate.CandidateId, skills)

  await resumeRepo.create({
    candidateId: candidate.CandidateId,
    fileName: file.originalname,
    filePath: file.path,
    extractedText: extractedText.slice(0, 50000),
  })

  const jobs = jobId ? [await jobRepo.findById(jobId)] : await jobRepo.findAll()
  const matchResults = []
  for (const job of jobs.filter(Boolean)) {
    if (job.Status !== 'Open') continue
    const jobSkills = await jobRepo.getSkills(job.JobId)
    const result = await matchingService.scoreCandidateForJob(candidate, skills, job, jobSkills, extractedText)
    await matchRepo.upsert(result)
    matchResults.push(result)
  }

  matchResults.sort((a, b) => b.finalScore - a.finalScore)
  const best = matchResults[0] || null

  return {
    candidate: await formatCandidate(candidate.CandidateId, best),
    matches: matchResults,
    parsed,
  }
}

function parseJsonArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function formatCandidate(candidateId, bestMatch = null) {
  const candidate = await candidateRepo.findById(candidateId)
  const skills = await candidateRepo.getSkills(candidateId)
  const best = bestMatch || (await matchRepo.getBestMatchForCandidate(candidateId))
  const resumes = await resumeRepo.findByCandidateId(candidateId)
  const interview = await require('../repositories/interviewRepository').getByCandidate(candidateId)

  const matchedSkills = best?.matchedSkills || parseJsonArray(best?.MatchedSkills)
  const missingSkills = best?.missingSkills || parseJsonArray(best?.MissingSkills)
  const finalScore = best?.finalScore ?? best?.FinalScore ?? 0

  return {
    id: String(candidate.CandidateId),
    candidateId: candidate.CandidateId,
    name: candidate.Name,
    email: candidate.Email,
    phone: candidate.Phone,
    experienceYears: candidate.ExperienceYears,
    education: candidate.Education,
    currentTitle: candidate.CurrentTitle,
    location: candidate.Location,
    summary: candidate.Summary,
    skills: skills.map((s) => s.SkillName),
    resumeFileName: resumes[0]?.FileName,
    uploadedAt: resumes[0]?.UploadedAt
      ? new Date(resumes[0].UploadedAt).toISOString().slice(0, 10)
      : null,
    matchedJobId: best ? String(best.jobId ?? best.JobId) : null,
    similarityScore: Math.round(finalScore),
    finalScore: Math.round(finalScore),
    matchedSkills: Array.isArray(matchedSkills) ? matchedSkills : [],
    missingSkills: Array.isArray(missingSkills) ? missingSkills : [],
    explanation: best?.explanation ?? best?.Explanation,
    status: interview ? 'in_pipeline' : 'matched',
    pipelineStage: interview ? require('../utils/validation').toUiStage(interview.Stage) : null,
    notes: interview?.Notes || '',
  }
}

module.exports = { uploadResume, extractTextFromFile, formatCandidate, fallbackParse }
