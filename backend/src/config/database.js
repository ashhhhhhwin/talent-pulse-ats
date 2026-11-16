const sql = require('mssql')
const env = require('./env')
const logger = require('../utils/logger')

let pool = null

const config = {
  server: env.db.server,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
  options: {
    encrypt: env.db.options.encrypt,
    trustServerCertificate: env.db.options.trustServerCertificate,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

async function getPool() {
  if (pool) return pool
  try {
    pool = await sql.connect(config)
    logger.info('Connected to SQL Server')
    return pool
  } catch (err) {
    logger.error('SQL Server connection failed', { message: err.message })
    throw err
  }
}

async function query(text, params = {}) {
  const p = await getPool()
  const request = p.request()
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value)
  }
  return request.query(text)
}

async function closePool() {
  if (pool) {
    await pool.close()
    pool = null
  }
}

module.exports = { sql, getPool, query, closePool }
