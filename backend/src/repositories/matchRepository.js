const { query } = require('../config/database')

async function upsert(match) {
  const result = await query(
    `MERGE MatchScores AS target
     USING (SELECT @jobId AS JobId, @candidateId AS CandidateId) AS source
     ON target.JobId = source.JobId AND target.CandidateId = source.CandidateId
     WHEN MATCHED THEN UPDATE SET
       SemanticScore = @semanticScore, SkillScore = @skillScore,
       ExperienceScore = @experienceScore, MandatoryScore = @mandatoryScore,
       FinalScore = @finalScore, MatchedSkills = @matchedSkills,
       MissingSkills = @missingSkills, Explanation = @explanation,
       CreatedAt = SYSUTCDATETIME()
     WHEN NOT MATCHED THEN INSERT
       (JobId, CandidateId, SemanticScore, SkillScore, ExperienceScore, MandatoryScore,
        FinalScore, MatchedSkills, MissingSkills, Explanation)
     VALUES (@jobId, @candidateId, @semanticScore, @skillScore, @experienceScore, @mandatoryScore,
             @finalScore, @matchedSkills, @missingSkills, @explanation)
     OUTPUT INSERTED.*;`,
    {
      jobId: match.jobId,
      candidateId: match.candidateId,
      semanticScore: match.semanticScore,
      skillScore: match.skillScore,
      experienceScore: match.experienceScore,
      mandatoryScore: match.mandatoryScore,
      finalScore: match.finalScore,
      matchedSkills: JSON.stringify(match.matchedSkills || []),
      missingSkills: JSON.stringify(match.missingSkills || []),
      explanation: match.explanation || '',
    },
  )
  return result.recordset[0]
}

async function findByJob(jobId, topN = null) {
  let sqlText = `
    SELECT ms.*, c.Name AS CandidateName, c.Email, c.ExperienceYears, c.CurrentTitle
    FROM MatchScores ms
    INNER JOIN Candidates c ON ms.CandidateId = c.CandidateId
    WHERE ms.JobId = @jobId
    ORDER BY ms.FinalScore DESC`
  if (topN) sqlText += ` OFFSET 0 ROWS FETCH NEXT ${parseInt(topN, 10)} ROWS ONLY`
  const result = await query(sqlText, { jobId })
  return result.recordset
}

async function findByJobAndCandidate(jobId, candidateId) {
  const result = await query(
    `SELECT ms.*, c.Name AS CandidateName, c.Email, c.ExperienceYears
     FROM MatchScores ms
     INNER JOIN Candidates c ON ms.CandidateId = c.CandidateId
     WHERE ms.JobId = @jobId AND ms.CandidateId = @candidateId`,
    { jobId, candidateId },
  )
  return result.recordset[0] || null
}

async function getBestMatchForCandidate(candidateId) {
  const result = await query(
    `SELECT TOP 1 ms.*, j.Title AS JobTitle
     FROM MatchScores ms
     INNER JOIN Jobs j ON ms.JobId = j.JobId
     WHERE ms.CandidateId = @candidateId
     ORDER BY ms.FinalScore DESC`,
    { candidateId },
  )
  return result.recordset[0] || null
}

module.exports = { upsert, findByJob, findByJobAndCandidate, getBestMatchForCandidate }
