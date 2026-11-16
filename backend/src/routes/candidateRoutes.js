const express = require('express')
const candidateController = require('../controllers/candidateController')
const { validate, stageSchema } = require('../utils/validation')
const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', candidateController.list)
router.get('/:candidateId', candidateController.get)
router.patch('/:candidateId/stage', authMiddleware, validate(stageSchema), candidateController.updateStage)
router.patch('/:candidateId/notes', authMiddleware, candidateController.updateNotes)

module.exports = router
