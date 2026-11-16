const aiClient = require('../config/aiService')
const { AppError } = require('../middleware/errorMiddleware')
const logger = require('../utils/logger')

async function chat(message, history = []) {
  try {
    const { data } = await aiClient.post('/ai/assistant/chat', { message, history })
    return data
  } catch (err) {
    const detail = err.response?.data?.detail
    logger.error('Assistant chat failed', { message: detail || err.message })
    if (err.response?.status === 503) {
      throw new AppError(detail || 'AI assistant is not configured. Set GOOGLE_API_KEY and TAVILY_API_KEY.', 503)
    }
    throw new AppError(detail || 'Assistant query failed', err.response?.status || 500)
  }
}

module.exports = { chat }
