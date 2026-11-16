const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const swaggerUi = require('swagger-ui-express')
const env = require('./config/env')
const { errorHandler, notFound } = require('./middleware/errorMiddleware')

const authRoutes = require('./routes/authRoutes')
const jobRoutes = require('./routes/jobRoutes')
const resumeRoutes = require('./routes/resumeRoutes')
const candidateRoutes = require('./routes/candidateRoutes')
const matchingRoutes = require('./routes/matchingRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const interviewRoutes = require('./routes/interviewRoutes')
const assistantRoutes = require('./routes/assistantRoutes')

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Smart Recruiter API',
    version: '1.0.0',
    description: 'Node.js + Express backend for AI-based recruitment and candidate matching',
  },
  servers: [{ url: `http://localhost:${env.port}/api` }],
  paths: {
    '/auth/login': { post: { summary: 'Recruiter login' } },
    '/jobs': { get: { summary: 'List jobs' }, post: { summary: 'Create job' } },
    '/resumes/upload': { post: { summary: 'Upload and parse resume' } },
    '/matching/jobs/{jobId}/run': { post: { summary: 'Run matching for job' } },
    '/matching/jobs/{jobId}/results': { get: { summary: 'Get ranked match results' } },
    '/candidates/{candidateId}/stage': { patch: { summary: 'Update pipeline stage' } },
    '/dashboard/stats': { get: { summary: 'Dashboard KPIs' } },
  },
}

const app = express()

app.set('etag', false)

app.use(helmet())
app.use(cors({ origin: env.corsOrigin, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'smart-recruiter-api', env: env.nodeEnv })
})

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/candidates', candidateRoutes)
app.use('/api/matching', matchingRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/interviews', interviewRoutes)
app.use('/api/assistant', assistantRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
