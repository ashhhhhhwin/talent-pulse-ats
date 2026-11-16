const { query } = require('../config/database')

async function create({ candidateId, fileName, filePath, extractedText }) {
  const result = await query(
    `INSERT INTO Resumes (CandidateId, FileName, FilePath, ExtractedText)
     OUTPUT INSERTED.*
     VALUES (@candidateId, @fileName, @filePath, @extractedText)`,
    { candidateId, fileName, filePath, extractedText },
  )
  return result.recordset[0]
}

async function findByCandidateId(candidateId) {
  const result = await query(
    `SELECT * FROM Resumes WHERE CandidateId = @candidateId ORDER BY UploadedAt DESC`,
    { candidateId },
  )
  return result.recordset
}

module.exports = { create, findByCandidateId }
