const { query } = require('../config/database')

async function findAll() {
  const result = await query(
    `SELECT JobId, Title, Description, MinimumExperience, CreatedBy, CreatedAt, Status
     FROM Jobs ORDER BY CreatedAt DESC`,
  )
  return result.recordset
}

async function findById(jobId) {
  const result = await query(
    `SELECT JobId, Title, Description, MinimumExperience, CreatedBy, CreatedAt, Status
     FROM Jobs WHERE JobId = @jobId`,
    { jobId },
  )
  return result.recordset[0] || null
}

async function create({ title, description, minimumExperience, createdBy, status }) {
  const result = await query(
    `INSERT INTO Jobs (Title, Description, MinimumExperience, CreatedBy, Status)
     OUTPUT INSERTED.*
     VALUES (@title, @description, @minimumExperience, @createdBy, @status)`,
    { title, description, minimumExperience, createdBy, status },
  )
  return result.recordset[0]
}

async function update(jobId, fields) {
  const result = await query(
    `UPDATE Jobs SET Title = @title, Description = @description,
     MinimumExperience = @minimumExperience, Status = @status
     OUTPUT INSERTED.*
     WHERE JobId = @jobId`,
    { jobId, ...fields },
  )
  return result.recordset[0] || null
}

async function getSkills(jobId) {
  const result = await query(
    `SELECT JobSkillId, JobId, SkillName, SkillNormalized, IsMandatory
     FROM JobSkills WHERE JobId = @jobId`,
    { jobId },
  )
  return result.recordset
}

async function setSkills(jobId, skills) {
  await query(`DELETE FROM JobSkills WHERE JobId = @jobId`, { jobId })
  for (const skill of skills) {
    await query(
      `INSERT INTO JobSkills (JobId, SkillName, SkillNormalized, IsMandatory)
       VALUES (@jobId, @skillName, @skillNormalized, @isMandatory)`,
      {
        jobId,
        skillName: skill.skillName,
        skillNormalized: skill.skillNormalized,
        isMandatory: skill.isMandatory ? 1 : 0,
      },
    )
  }
}

module.exports = { findAll, findById, create, update, getSkills, setSkills }
