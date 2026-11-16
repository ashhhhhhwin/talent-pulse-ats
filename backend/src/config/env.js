require('dotenv').config()

const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  db: {
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    database: process.env.DB_NAME || 'SmartRecruiter',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    options: {
      encrypt: process.env.DB_ENCRYPT !== 'false',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    },
  },
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  weights: {
    semantic: parseFloat(process.env.WEIGHT_SEMANTIC) || 0.5,
    skill: parseFloat(process.env.WEIGHT_SKILL) || 0.3,
    experience: parseFloat(process.env.WEIGHT_EXPERIENCE) || 0.15,
    mandatory: parseFloat(process.env.WEIGHT_MANDATORY) || 0.05,
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads/resumes',
    maxSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
  },
}

module.exports = env
