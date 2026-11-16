const path = require('path')
const fs = require('fs')
const multer = require('multer')
const env = require('../config/env')
const { AppError } = require('./errorMiddleware')

const uploadDir = path.resolve(process.cwd(), env.upload.dir)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const ALLOWED = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ALLOWED[file.mimetype] || ''
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}-${safe}${ext && !safe.endsWith(ext) ? ext : ''}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: env.upload.maxSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const ok =
      ALLOWED[file.mimetype] ||
      ['.pdf', '.docx', '.doc'].includes(ext)
    if (!ok) {
      return cb(new AppError('Unsupported file format. Use PDF or DOCX.', 400))
    }
    cb(null, true)
  },
})

module.exports = { upload, uploadDir }
