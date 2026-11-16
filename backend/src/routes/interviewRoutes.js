const express = require('express')
const interviewController = require('../controllers/interviewController')

const router = express.Router()

router.get('/', interviewController.list)

module.exports = router
