const express = require('express')
const resumeController = require('../controllers/resumeController')
const { upload } = require('../middleware/uploadMiddleware')
const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/upload', authMiddleware, upload.single('resume'), resumeController.upload)

module.exports = router
