require('dotenv').config()
const app = require('./app')
const env = require('./config/env')
const logger = require('./utils/logger')
const { closePool } = require('./config/database')

// Bind all interfaces so Vite's localhost proxy (often ::1 on Windows) can reach us.
const server = app.listen(env.port, '0.0.0.0', () => {
  logger.info(`Smart Recruiter API listening on http://localhost:${env.port}`)
})

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down`)
  server.close(async () => {
    await closePool()
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
