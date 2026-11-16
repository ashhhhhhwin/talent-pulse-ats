/**
 * Clears demo/transactional data from Smart Recruiter DB.
 *
 * Default: removes candidates, resumes, match scores, interviews, audit logs,
 * and uploaded resume files. Keeps admin user, roles, and job openings.
 *
 * Usage:
 *   npm run db:clear
 *   npm run db:clear -- --full        # also remove jobs, then re-seed sample jobs
 *   node scripts/clearDb.js --dry-run # show what would be deleted
 */
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { getPool, query, closePool } = require('../src/config/database')
const env = require('../src/config/env')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const fullReset = args.includes('--full')

const TABLES = [
  'InterviewHistory',
  'Interviews',
  'MatchScores',
  'Resumes',
  'CandidateSkills',
  'Candidates',
  'AuditLogs',
]

const FULL_RESET_TABLES = ['JobSkills', 'Jobs']

async function countRows(table) {
  const result = await query(`SELECT COUNT(*) AS cnt FROM ${table}`)
  return result.recordset[0].cnt
}

function clearUploadFiles() {
  const uploadDir = path.resolve(__dirname, '..', env.upload.dir)
  if (!fs.existsSync(uploadDir)) {
    return { uploadDir, removed: 0 }
  }

  const files = fs.readdirSync(uploadDir).filter((name) => {
    const fullPath = path.join(uploadDir, name)
    return fs.statSync(fullPath).isFile()
  })

  if (!dryRun) {
    for (const file of files) {
      fs.unlinkSync(path.join(uploadDir, file))
    }
  }

  return { uploadDir, removed: files.length }
}

async function resetIdentity(table) {
  try {
    await query(`DBCC CHECKIDENT ('${table}', RESEED, 0)`)
  } catch (err) {
    console.warn(`  (skipped identity reset for ${table}: ${err.message})`)
  }
}

async function clearDatabase() {
  await getPool()

  console.log('Smart Recruiter — database clear')
  console.log(`Mode: ${fullReset ? 'FULL (jobs + candidates)' : 'CANDIDATES ONLY'}`)
  if (dryRun) console.log('Dry run — no changes will be made.\n')

  const tablesToClear = fullReset ? [...TABLES, ...FULL_RESET_TABLES] : TABLES

  for (const table of tablesToClear) {
    const before = await countRows(table)
    console.log(`${table}: ${before} row(s)`)

    if (!dryRun && before > 0) {
      await query(`DELETE FROM ${table}`)
      await resetIdentity(table)
    }
  }

  const { uploadDir, removed } = clearUploadFiles()
  console.log(`Upload files (${uploadDir}): ${removed} file(s)`)

  if (dryRun) {
    console.log('\nDry run complete. Re-run without --dry-run to apply.')
    await closePool()
    return
  }

  if (fullReset) {
    await closePool()
    console.log('\nRe-seeding sample jobs and admin user...')
    require('./initDb')
    return
  }

  await closePool()
  console.log('\nDatabase cleared. Admin login and job openings are unchanged.')
  console.log('You can now upload demo resumes from UI/demo-resumes/.')
}

clearDatabase().catch(async (err) => {
  console.error('Clear failed:', err.message)
  await closePool().catch(() => {})
  process.exit(1)
})
