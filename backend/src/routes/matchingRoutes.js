const express = require('express')
const matchingController = require('../controllers/matchingController')
const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/jobs/:jobId/run', authMiddleware, matchingController.run)
router.get('/jobs/:jobId/results', matchingController.results)
router.get('/jobs/:jobId/candidates/:candidateId', matchingController.candidateResult)

module.exports = router
