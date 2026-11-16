const { query } = require('../config/database')

async function findAll() {
  const result = await query(
    `SELECT CandidateId, Name, Email, Phone, ExperienceYears, Education,
            CurrentTitle, Location, Summary, CreatedAt
     FROM Candidates ORDER BY CreatedAt DESC`,
  )
  return result.recordset
}

async function findById(candidateId) {
  const result = await query(
    `SELECT * FROM Candidates WHERE CandidateId = @candidateId`,
    { candidateId },
  )
  return result.recordset[0] || null
}

async function create(candidate) {
  const result = await query(
    `INSERT INTO Candidates (Name, Email, Phone, ExperienceYears, Education, CurrentTitle, Location, Summary)
     OUTPUT INSERTED.*
     VALUES (@name, @email, @phone, @experienceYears, @education, @currentTitle, @location, @summary)`,
    {
      name: candidate.name,
      email: candidate.email || null,
      phone: candidate.phone || null,
      experienceYears: candidate.experienceYears || 0,
      education: candidate.education || null,
      currentTitle: candidate.currentTitle || null,
      location: candidate.location || null,
      summary: candidate.summary || null,
    },
  )
  return result.recordset[0]
}

async function getSkills(candidateId) {
  const result = await query(
    `SELECT SkillName, SkillNormalized FROM CandidateSkills WHERE CandidateId = @candidateId`,
    { candidateId },
  )
  return result.recordset
}

async function setSkills(candidateId, skills) {
  await query(`DELETE FROM CandidateSkills WHERE CandidateId = @candidateId`, { candidateId })
  for (const skill of skills) {
    await query(
      `INSERT INTO CandidateSkills (CandidateId, SkillName, SkillNormalized)
       VALUES (@candidateId, @skillName, @skillNormalized)`,
      { candidateId, skillName: skill.skillName, skillNormalized: skill.skillNormalized },
    )
  }
}

module.exports = { findAll, findById, create, getSkills, setSkills }
