const express = require('express')
const authController = require('../controllers/authController')
const { validate, loginSchema, registerSchema } = require('../utils/validation')
const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', validate(registerSchema), authController.register)
router.post('/login', validate(loginSchema), authController.login)
router.get('/profile', authMiddleware, authController.profile)

module.exports = router
