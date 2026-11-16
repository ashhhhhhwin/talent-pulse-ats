const jobRepo = require('../repositories/jobRepository')
const { AppError } = require('../middleware/errorMiddleware')

function mapJobToUi(job, skills = []) {
  const required = skills.filter((s) => s.IsMandatory).map((s) => s.SkillName)
  const preferred = skills.filter((s) => !s.IsMandatory).map((s) => s.SkillName)
  return {
    id: String(job.JobId),
    jobId: job.JobId,
    title: job.Title,
    description: job.Description,
    minimumExperience: job.MinimumExperience,
    experience: `${job.MinimumExperience}+ years`,
    status: job.Status,
    requiredSkills: required,
    preferredSkills: preferred,
    createdAt: job.CreatedAt,
    department: 'Engineering',
    location: 'Hybrid',
    type: 'Full-time',
    openings: 1,
    postedAt: job.CreatedAt ? new Date(job.CreatedAt).toISOString().slice(0, 10) : null,
  }
}

async function listJobs() {
  const jobs = await jobRepo.findAll()
  const enriched = await Promise.all(
    jobs.map(async (job) => mapJobToUi(job, await jobRepo.getSkills(job.JobId))),
  )
  return enriched
}

async function getJob(jobId) {
  const job = await jobRepo.findById(jobId)
  if (!job) throw new AppError('Job not found', 404)
  const skills = await jobRepo.getSkills(jobId)
  return mapJobToUi(job, skills)
}

async function createJob(payload, userId) {
  const job = await jobRepo.create({
    title: payload.title,
    description: payload.description,
    minimumExperience: payload.minimumExperience,
    createdBy: userId,
    status: payload.status || 'Open',
  })

  const skills = buildSkillRows(payload.requiredSkills, payload.preferredSkills)
  await jobRepo.setSkills(job.JobId, skills)
  return getJob(job.JobId)
}

async function updateJob(jobId, payload) {
  const job = await jobRepo.update(jobId, {
    title: payload.title,
    description: payload.description,
    minimumExperience: payload.minimumExperience,
    status: payload.status,
  })
  if (!job) throw new AppError('Job not found', 404)
  if (payload.requiredSkills || payload.preferredSkills) {
    await jobRepo.setSkills(jobId, buildSkillRows(payload.requiredSkills || [], payload.preferredSkills || []))
  }
  return getJob(jobId)
}

function buildSkillRows(required = [], preferred = []) {
  const rows = []
  for (const s of required) {
    rows.push({ skillName: s, skillNormalized: s.toLowerCase(), isMandatory: true })
  }
  for (const s of preferred) {
    rows.push({ skillName: s, skillNormalized: s.toLowerCase(), isMandatory: false })
  }
  return rows
}

module.exports = { listJobs, getJob, createJob, updateJob, mapJobToUi }
