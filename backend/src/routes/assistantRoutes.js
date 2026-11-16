const express = require('express')
const assistantController = require('../controllers/assistantController')
const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/chat', authMiddleware, assistantController.chat)

module.exports = router
