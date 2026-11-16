const assistantService = require('../services/assistantService')
const { success } = require('../utils/response')

async function chat(req, res, next) {
  try {
    const { message, history = [] } = req.body
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' })
    }
    const result = await assistantService.chat(message.trim(), history)
    return success(res, result)
  } catch (err) {
    next(err)
  }
}

module.exports = { chat }
