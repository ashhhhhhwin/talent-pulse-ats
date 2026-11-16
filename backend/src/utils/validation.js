const Joi = require('joi')

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(6).required(),
})

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(6).required(),
  roleId: Joi.number().integer().optional(),
})

const jobSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().min(10).required(),
  minimumExperience: Joi.number().min(0).default(0),
  status: Joi.string().valid('Open', 'Closed', 'Draft').default('Open'),
  requiredSkills: Joi.array().items(Joi.string()).default([]),
  preferredSkills: Joi.array().items(Joi.string()).default([]),
})

const stageSchema = Joi.object({
  stage: Joi.string()
    .valid(
      'APPLIED',
      'SHORTLISTED',
      'TECHNICAL_INTERVIEW',
      'OFFER_EXTENDED',
      'screening',
      'technical',
      'manager',
      'hr',
      'offer',
      'hired',
    )
    .required(),
  jobId: Joi.number().integer().allow(null).optional(),
})

const STAGE_MAP = {
  screening: 'APPLIED',
  technical: 'TECHNICAL_INTERVIEW',
  manager: 'TECHNICAL_INTERVIEW',
  hr: 'SHORTLISTED',
  offer: 'OFFER_EXTENDED',
  hired: 'OFFER_EXTENDED',
  APPLIED: 'APPLIED',
  SHORTLISTED: 'SHORTLISTED',
  TECHNICAL_INTERVIEW: 'TECHNICAL_INTERVIEW',
  OFFER_EXTENDED: 'OFFER_EXTENDED',
}

const UI_STAGE_MAP = {
  APPLIED: 'screening',
  SHORTLISTED: 'hr',
  TECHNICAL_INTERVIEW: 'technical',
  OFFER_EXTENDED: 'offer',
}

function normalizeStage(stage) {
  return STAGE_MAP[stage] || stage
}

function toUiStage(dbStage) {
  return UI_STAGE_MAP[dbStage] || dbStage?.toLowerCase()
}

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true })
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })),
      })
    }
    req[source] = value
    next()
  }
}

module.exports = {
  loginSchema,
  registerSchema,
  jobSchema,
  stageSchema,
  validate,
  normalizeStage,
  toUiStage,
}
