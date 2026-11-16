const { query } = require('../config/database')

async function getByCandidate(candidateId) {
  const result = await query(
    `SELECT * FROM Interviews WHERE CandidateId = @candidateId AND Status = 'ACTIVE'`,
    { candidateId },
  )
  return result.recordset[0] || null
}

async function upsert({ candidateId, jobId, stage, notes }) {
  const existing = await getByCandidate(candidateId)
  if (existing) {
    const result = await query(
      `UPDATE Interviews SET Stage = @stage, JobId = @jobId, Notes = COALESCE(@notes, Notes)
       OUTPUT INSERTED.*
       WHERE InterviewId = @interviewId`,
      { interviewId: existing.InterviewId, stage, jobId, notes: notes || null },
    )
    return { previous: existing.Stage, current: result.recordset[0] }
  }
  const result = await query(
    `INSERT INTO Interviews (CandidateId, JobId, Stage, Notes)
     OUTPUT INSERTED.*
     VALUES (@candidateId, @jobId, @stage, @notes)`,
    { candidateId, jobId, stage, notes: notes || null },
  )
  return { previous: null, current: result.recordset[0] }
}

async function addHistory({ candidateId, jobId, previousStage, newStage, changedBy }) {
  await query(
    `INSERT INTO InterviewHistory (CandidateId, JobId, PreviousStage, NewStage, ChangedBy)
     VALUES (@candidateId, @jobId, @previousStage, @newStage, @changedBy)`,
    { candidateId, jobId, previousStage, newStage, changedBy },
  )
}

async function findAllActive() {
  const result = await query(
    `SELECT i.*, c.Name AS CandidateName, c.ExperienceYears, j.Title AS JobTitle
     FROM Interviews i
     INNER JOIN Candidates c ON i.CandidateId = c.CandidateId
     LEFT JOIN Jobs j ON i.JobId = j.JobId
     WHERE i.Status = 'ACTIVE'`,
  )
  return result.recordset
}

async function updateNotes(candidateId, notes) {
  await query(
    `UPDATE Interviews SET Notes = @notes WHERE CandidateId = @candidateId AND Status = 'ACTIVE'`,
    { candidateId, notes },
  )
}

module.exports = { getByCandidate, upsert, addHistory, findAllActive, updateNotes }
