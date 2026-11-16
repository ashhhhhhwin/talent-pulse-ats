const express = require('express')
const jobController = require('../controllers/jobController')
const { validate, jobSchema } = require('../utils/validation')
const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', jobController.list)
router.get('/:jobId', jobController.get)
router.post('/', authMiddleware, validate(jobSchema), jobController.create)
router.put('/:jobId', authMiddleware, validate(jobSchema), jobController.update)

module.exports = router
